package br.com.gustavoeude.reprodutormusical;

import android.Manifest;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;

import androidx.core.content.ContextCompat;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/** Ponte entre o JavaScript do app e o serviço de reprodução em segundo plano. */
@CapacitorPlugin(name = "MusicaNative")
public class MusicaPlugin extends Plugin {

    @Override
    public void load() {
        MusicaPlaybackService.stateListener = (playing, positionMs, durationMs, playbackState, error) -> {
            JSObject state = new JSObject();
            state.put("playing", playing);
            state.put("position", positionMs / 1000.0);
            state.put("duration", durationMs / 1000.0);
            state.put("playbackState", playbackState);
            if (error != null) state.put("error", error);
            notifyListeners("playerState", state);
        };
        MusicaService.listener = (action, positionMs) -> {
            JSObject o = new JSObject();
            o.put("action", action);
            o.put("position", positionMs < 0 ? 0 : positionMs / 1000.0);
            notifyListeners("action", o);
        };
    }

    @PluginMethod
    public void update(PluginCall call) {
        try {
            Context ctx = getContext();
            Intent i = new Intent(ctx, MusicaService.class).setAction(MusicaService.ACT_UPDATE);
            if (call.hasOption("title")) i.putExtra("title", call.getString("title"));
            if (call.hasOption("artist")) i.putExtra("artist", call.getString("artist"));
            if (call.hasOption("playing")) i.putExtra("playing", call.getBoolean("playing", false));
            if (call.hasOption("position")) i.putExtra("position", call.getDouble("position", 0.0));
            if (call.hasOption("duration")) i.putExtra("duration", call.getDouble("duration", 0.0));
            if (call.hasOption("rate")) i.putExtra("rate", call.getDouble("rate", 1.0));
            if (call.hasOption("cover")) i.putExtra("cover", call.getString("cover"));

            MusicaService running = MusicaService.instance;
            if (running != null) running.apply(i);
            else ContextCompat.startForegroundService(ctx, i);
            call.resolve();
        } catch (Exception e) {
            call.reject("Não foi possível atualizar o serviço: " + e.getMessage());
        }
    }


    // Armazenamento privado: recebe arquivos em blocos para evitar enviar músicas
    // grandes em uma única chamada pela ponte JavaScript/Android.
    private final java.util.Map<String, java.io.FileOutputStream> pendingSongTransfers =
            new java.util.concurrent.ConcurrentHashMap<>();

    private static String songFileKey(String id) throws Exception {
        java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
        byte[] hash = digest.digest(id.getBytes(java.nio.charset.StandardCharsets.UTF_8));
        StringBuilder out = new StringBuilder();
        for (byte b : hash) out.append(String.format(java.util.Locale.ROOT, "%02x", b));
        return out.toString();
    }

    @PluginMethod
    public void beginSongTransfer(PluginCall call) {
        String id = call.getString("id");
        String fileName = call.getString("fileName", "audio.bin");
        if (id == null || id.trim().isEmpty()) {
            call.reject("Identificador da música ausente.");
            return;
        }
        try {
            java.io.File dir = new java.io.File(getContext().getFilesDir(), "music");
            if (!dir.exists() && !dir.mkdirs()) throw new java.io.IOException("Não foi possível criar a pasta de músicas.");
            String ext = "bin";
            int dot = fileName.lastIndexOf('.');
            if (dot >= 0 && dot < fileName.length() - 1) {
                String candidate = fileName.substring(dot + 1).toLowerCase(java.util.Locale.ROOT);
                if (candidate.matches("[a-z0-9]{1,8}")) ext = candidate;
            }
            String key = songFileKey(id);
            java.io.File temp = new java.io.File(dir, key + ".part");
            java.io.FileOutputStream old = pendingSongTransfers.remove(id);
            if (old != null) try { old.close(); } catch (Exception ignored) {}
            pendingSongTransfers.put(id, new java.io.FileOutputStream(temp, false));
            JSObject result = new JSObject();
            result.put("ok", true);
            call.resolve(result);
        } catch (Exception e) {
            call.reject("Não foi possível iniciar a cópia: " + e.getMessage());
        }
    }

    @PluginMethod
    public void appendSongTransfer(PluginCall call) {
        String id = call.getString("id");
        String chunk = call.getString("chunk");
        java.io.FileOutputStream stream = id == null ? null : pendingSongTransfers.get(id);
        if (stream == null || chunk == null) {
            call.reject("Transferência de música não encontrada.");
            return;
        }
        try {
            byte[] bytes = android.util.Base64.decode(chunk, android.util.Base64.DEFAULT);
            synchronized (stream) { stream.write(bytes); }
            call.resolve();
        } catch (Exception e) {
            call.reject("Falha ao gravar parte da música: " + e.getMessage());
        }
    }

    @PluginMethod
    public void finishSongTransfer(PluginCall call) {
        String id = call.getString("id");
        String fileName = call.getString("fileName", "audio.bin");
        java.io.FileOutputStream stream = id == null ? null : pendingSongTransfers.remove(id);
        if (stream == null) {
            call.reject("Transferência de música não encontrada.");
            return;
        }
        try {
            synchronized (stream) { stream.flush(); stream.close(); }
            java.io.File dir = new java.io.File(getContext().getFilesDir(), "music");
            String ext = "bin";
            int dot = fileName.lastIndexOf('.');
            if (dot >= 0 && dot < fileName.length() - 1) {
                String candidate = fileName.substring(dot + 1).toLowerCase(java.util.Locale.ROOT);
                if (candidate.matches("[a-z0-9]{1,8}")) ext = candidate;
            }
            String key = songFileKey(id);
            java.io.File temp = new java.io.File(dir, key + ".part");
            java.io.File target = new java.io.File(dir, key + "." + ext);
            if (target.exists() && !target.delete()) throw new java.io.IOException("Não foi possível substituir a cópia anterior.");
            if (!temp.renameTo(target)) throw new java.io.IOException("Não foi possível finalizar a cópia.");
            JSObject result = new JSObject();
            result.put("path", target.getAbsolutePath());
            call.resolve(result);
        } catch (Exception e) {
            call.reject("Não foi possível finalizar a cópia: " + e.getMessage());
        }
    }

    @PluginMethod
    public void abortSongTransfer(PluginCall call) {
        String id = call.getString("id");
        java.io.FileOutputStream stream = id == null ? null : pendingSongTransfers.remove(id);
        if (stream != null) try { stream.close(); } catch (Exception ignored) {}
        call.resolve();
    }

    @PluginMethod
    public void deleteSongFile(PluginCall call) {
        String path = call.getString("path");
        try {
            if (path != null && !path.trim().isEmpty()) {
                java.io.File dir = new java.io.File(getContext().getFilesDir(), "music").getCanonicalFile();
                java.io.File target = new java.io.File(path).getCanonicalFile();
                if (target.getPath().startsWith(dir.getPath() + java.io.File.separator) && target.isFile()) {
                    // A exclusão do arquivo nativo acompanha a exclusão solicitada na biblioteca.
                    if (!target.delete()) throw new java.io.IOException("Não foi possível excluir a cópia.");
                }
            }
            call.resolve();
        } catch (Exception e) {
            call.reject("Não foi possível excluir a cópia nativa: " + e.getMessage());
        }
    }


    private void sendPlaybackAction(String action, String key, long value) {
        Intent intent = new Intent(getContext(), MusicaPlaybackService.class).setAction(action);
        if (key != null) intent.putExtra(key, value);
        getContext().startService(intent);
    }

    @PluginMethod
    public void setTrack(PluginCall call) {
        String path = call.getString("path");
        if (path == null || path.trim().isEmpty()) {
            call.reject("Caminho da música ausente.");
            return;
        }
        try {
            Intent intent = new Intent(getContext(), MusicaPlaybackService.class)
                    .setAction(MusicaPlaybackService.ACTION_SET_TRACK)
                    .putExtra("path", path)
                    .putExtra("title", call.getString("title", "Música"))
                    .putExtra("artist", call.getString("artist", ""))
                    .putExtra("autoplay", call.getBoolean("autoplay", true));
            ContextCompat.startForegroundService(getContext(), intent);
            call.resolve();
        } catch (Exception e) {
            call.reject("Não foi possível abrir a música no player Android: " + e.getMessage());
        }
    }

    @PluginMethod
    public void play(PluginCall call) {
        MusicaPlaybackService service = MusicaPlaybackService.instance;
        if (service != null) service.onStartCommand(new Intent(getContext(), MusicaPlaybackService.class)
                .setAction(MusicaPlaybackService.ACTION_PLAY), 0, 0);
        else {
            try { ContextCompat.startForegroundService(getContext(),
                    new Intent(getContext(), MusicaPlaybackService.class).setAction(MusicaPlaybackService.ACTION_PLAY)); }
            catch (Exception e) { call.reject("Não foi possível iniciar a reprodução: " + e.getMessage()); return; }
        }
        call.resolve();
    }

    @PluginMethod
    public void pause(PluginCall call) {
        MusicaPlaybackService service = MusicaPlaybackService.instance;
        if (service != null) service.onStartCommand(new Intent(getContext(), MusicaPlaybackService.class)
                .setAction(MusicaPlaybackService.ACTION_PAUSE), 0, 0);
        call.resolve();
    }

    @PluginMethod
    public void seekTo(PluginCall call) {
        double seconds = call.getDouble("position", 0.0);
        MusicaPlaybackService service = MusicaPlaybackService.instance;
        if (service != null) service.onStartCommand(new Intent(getContext(), MusicaPlaybackService.class)
                .setAction(MusicaPlaybackService.ACTION_SEEK)
                .putExtra("position", Math.max(0L, (long) (seconds * 1000))), 0, 0);
        call.resolve();
    }

    @PluginMethod
    public void setRate(PluginCall call) {
        double rate = call.getDouble("rate", 1.0);
        MusicaPlaybackService service = MusicaPlaybackService.instance;
        if (service != null) service.onStartCommand(new Intent(getContext(), MusicaPlaybackService.class)
                .setAction(MusicaPlaybackService.ACTION_RATE)
                .putExtra("rate", (float) rate), 0, 0);
        call.resolve();
    }

    @PluginMethod
    public void stopPlayback(PluginCall call) {
        MusicaPlaybackService service = MusicaPlaybackService.instance;
        if (service != null) {
            service.onStartCommand(new Intent(getContext(), MusicaPlaybackService.class)
                    .setAction(MusicaPlaybackService.ACTION_PAUSE), 0, 0);
            service.stopSelf();
        }
        call.resolve();
    }

    @PluginMethod
    public void stop(PluginCall call) {
        try {
            getContext().stopService(new Intent(getContext(), MusicaService.class));
        } catch (Exception ignored) {}
        call.resolve();
    }

    /** Android 13+: sem essa permissão a notificação de mídia fica escondida. */
    @PluginMethod
    public void requestNotifications(PluginCall call) {
        try {
            if (Build.VERSION.SDK_INT >= 33
                    && ContextCompat.checkSelfPermission(getContext(), Manifest.permission.POST_NOTIFICATIONS)
                    != PackageManager.PERMISSION_GRANTED) {
                getActivity().requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS}, 4711);
            }
        } catch (Exception ignored) {}
        call.resolve();
    }
}
