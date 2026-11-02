package br.com.gustavoeude.reprodutormusical;

import android.os.Bundle;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(MusicaPlugin.class);
        super.onCreate(savedInstanceState);
        try {
            getBridge().getWebView().getSettings().setMediaPlaybackRequiresUserGesture(false);
        } catch (Exception ignored) {}
    }

    // Com a tela bloqueada ou o app em segundo plano, o WebView não pode "dormir":
    // senão o áudio e os temporizadores do JavaScript param.
    private void keepWebViewAlive() {
        try {
            WebView w = getBridge().getWebView();
            w.onResume();
            w.resumeTimers();
        } catch (Exception ignored) {}
    }

    @Override
    public void onPause() {
        super.onPause();
        keepWebViewAlive();
    }

    @Override
    public void onStop() {
        super.onStop();
        keepWebViewAlive();
    }
}
