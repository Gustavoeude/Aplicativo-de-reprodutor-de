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
