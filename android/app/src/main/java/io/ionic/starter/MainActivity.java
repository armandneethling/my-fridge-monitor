package io.ionic.starter;

// Import necessary classes
import android.os.Bundle;
import android.webkit.WebView; // Needed for WebView debugging

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

  @Override
  public void onCreate(Bundle savedInstanceState) {
    // Enable WebView debugging BEFORE the parent class's onCreate is called
    WebView.setWebContentsDebuggingEnabled(true);

    super.onCreate(savedInstanceState);

    // Initialize plugins here if needed, often handled by Capacitor automatically
    // registerPlugins(savedInstanceState);
  }
}
