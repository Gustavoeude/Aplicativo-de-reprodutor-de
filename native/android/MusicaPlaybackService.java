package br.com.gustavoeude.reprodutormusical;

import android.content.Intent;
import android.net.Uri;
import android.os.Handler;
import android.os.Looper;

import androidx.annotation.Nullable;
import androidx.media3.common.C;
import androidx.media3.common.MediaItem;
import androidx.media3.common.MediaMetadata;
import androidx.media3.common.PlaybackException;
import androidx.media3.common.Player;
import androidx.media3.exoplayer.ExoPlayer;
import androidx.media3.session.MediaSession;
import androidx.media3.session.MediaSessionService;

import java.io.File;

/** Player de áudio Android independente do WebView, hospedado em MediaSessionService. */
public class MusicaPlaybackService extends MediaSessionService {
    public static final String ACTION_SET_TRACK = "br.com.gustavoeude.reprodutormusical.SET_TRACK";
    public static final String ACTION_PLAY = "br.com.gustavoeude.reprodutormusical.PLAY";
    public static final String ACTION_PAUSE = "br.com.gustavoeude.reprodutormusical.PAUSE";
    public static final String ACTION_SEEK = "br.com.gustavoeude.reprodutormusical.SEEK";
    public static final String ACTION_RATE = "br.com.gustavoeude.reprodutormusical.RATE";

    public interface StateListener {
        void onState(boolean playing, long positionMs, long durationMs, int playbackState, String error);
    }

    public static volatile MusicaPlaybackService instance;
    public static volatile StateListener stateListener;

    private ExoPlayer player;
    private MediaSession mediaSession;
    private final Handler handler = new Handler(Looper.getMainLooper());
    private final Runnable ticker = new Runnable() {
        @Override public void run() {
            emitState(null);
            if (player != null && player.isPlaying()) handler.postDelayed(this, 500);
        }
    };

    @Override
    public void onCreate() {
        super.onCreate();
        instance = this;
        player = new ExoPlayer.Builder(this).build();
        mediaSession = new MediaSession.Builder(this, player).build();
        player.addListener(new Player.Listener() {
            @Override public void onIsPlayingChanged(boolean isPlaying) {
                emitState(null);
                handler.removeCallbacks(ticker);
                if (isPlaying) handler.post(ticker);
            }
            @Override public void onPlaybackStateChanged(int state) {
                emitState(null);
            }
            @Override public void onPlayerError(PlaybackException error) {
                emitState(error.getMessage());
            }
            @Override public void onMediaItemTransition(@Nullable MediaItem item, int reason) {
                emitState(null);
            }
        });
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && player != null) {
            String action = intent.getAction();
            if (ACTION_SET_TRACK.equals(action)) {
                String path = intent.getStringExtra("path");
                String title = intent.getStringExtra("title");
                String artist = intent.getStringExtra("artist");
                boolean autoplay = intent.getBooleanExtra("autoplay", true);
                File file = path == null ? null : new File(path);
                if (file != null && file.isFile() && file.canRead()) {
                    MediaMetadata metadata = new MediaMetadata.Builder()
                            .setTitle(title == null ? "Música" : title)
                            .setArtist(artist == null ? "" : artist)
                            .build();
                    MediaItem item = new MediaItem.Builder()
                            .setUri(Uri.fromFile(file))
                            .setMediaMetadata(metadata)
                            .build();
                    player.setMediaItem(item);
                    player.prepare();
                    if (autoplay) player.play();
                    emitState(null);
                } else {
                    emitState("Arquivo de música não encontrado no armazenamento privado.");
                }
            } else if (ACTION_PLAY.equals(action)) {
                player.play();
            } else if (ACTION_PAUSE.equals(action)) {
                player.pause();
            } else if (ACTION_SEEK.equals(action)) {
                player.seekTo(Math.max(0L, intent.getLongExtra("position", 0L)));
            } else if (ACTION_RATE.equals(action)) {
                float rate = intent.getFloatExtra("rate", 1f);
                if (rate > 0f && rate <= 4f) player.setPlaybackSpeed(rate);
            }
        }
        return super.onStartCommand(intent, flags, startId);
    }


    public void playNow() { if (player != null) player.play(); }
    public void pauseNow() { if (player != null) player.pause(); }
    public void seekNow(long positionMs) { if (player != null) player.seekTo(Math.max(0L, positionMs)); }
    public void setRateNow(float rate) {
        if (player != null && rate > 0f && rate <= 4f) player.setPlaybackSpeed(rate);
    }
    public void stopNow() {
        if (player != null) { player.pause(); player.clearMediaItems(); }
        stopSelf();
    }

    private void emitState(String error) {
        if (player == null) return;
        StateListener listener = stateListener;
        if (listener != null) {
            long duration = player.getDuration();
            if (duration == C.TIME_UNSET || duration < 0) duration = 0;
            listener.onState(player.isPlaying(), player.getCurrentPosition(), duration,
                    player.getPlaybackState(), error);
        }
    }

    @Nullable
    @Override
    public MediaSession onGetSession(MediaSession.ControllerInfo controllerInfo) {
        return mediaSession;
    }

    @Override
    public void onDestroy() {
        handler.removeCallbacks(ticker);
        instance = null;
        if (mediaSession != null) {
            mediaSession.getPlayer().release();
            mediaSession.release();
            mediaSession = null;
        }
        player = null;
        super.onDestroy();
    }
}
