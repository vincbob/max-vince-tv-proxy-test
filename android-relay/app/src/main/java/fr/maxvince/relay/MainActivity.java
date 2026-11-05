package fr.maxvince.relay;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.Gravity;
import android.view.View;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;

import java.net.Inet4Address;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Enumeration;
import java.util.List;

/** TV remote friendly UI: no hidden system access, no provider credentials. */
public final class MainActivity extends Activity {
    private TextView info;
    private final Handler handler = new Handler(Looper.getMainLooper());
    private final Runnable refresh = new Runnable() {
        @Override public void run() { updateStatus(); handler.postDelayed(this, 1800); }
    };

    @Override public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        ScrollView scroll = new ScrollView(this);
        scroll.setFillViewport(true);
        scroll.setBackgroundColor(Color.rgb(13, 22, 35));
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setPadding(dp(38), dp(27), dp(38), dp(26));
        scroll.addView(root);

        TextView title = text("MAX TV RELAIS ANDROID 01", 29, 0xffffaa63);
        root.addView(title);
        root.addView(text("Boîtier Bouygues / Android TV : diagnostic réseau local", 20, Color.WHITE));
        root.addView(text("Étape 01 : confirmer que la Hisense voit le serveur de ce boîtier. Aucun identifiant IPTV n'est demandé.", 19, 0xffcad6e6));
        info = text("État du relais", 22, Color.WHITE);
        info.setPadding(0, dp(15), 0, dp(18));
        info.setTextIsSelectable(true);
        root.addView(info);

        Button start = button("1. DÉMARRER LE RELAIS LOCAL");
        start.setOnClickListener(new View.OnClickListener() {
            @Override public void onClick(View view) {
                Intent intent = new Intent(MainActivity.this, RelayService.class);
                try {
                    if (Build.VERSION.SDK_INT >= 26) startForegroundService(intent);
                    else startService(intent);
                } catch (Exception e) {
                    info.setText("Le système Android refuse le démarrage du service.\n" +
                        "Vérifie les paramètres de l'application MAX TV RELAIS 01.");
                }
                handler.postDelayed(new Runnable() {
                    @Override public void run() { updateStatus(); }
                }, 400);
            }
        });
        root.addView(start);

        Button stop = button("2. ARRÊTER LE RELAIS");
        stop.setOnClickListener(new View.OnClickListener() {
            @Override public void onClick(View view) {
                stopService(new Intent(MainActivity.this, RelayService.class));
                handler.postDelayed(new Runnable() {
                    @Override public void run() { updateStatus(); }
                }, 300);
            }
        });
        root.addView(stop);

        Button reread = button("3. ACTUALISER L'ADRESSE");
        reread.setOnClickListener(new View.OnClickListener() {
            @Override public void onClick(View view) { updateStatus(); }
        });
        root.addView(reread);

        root.addView(text("Sur la Hisense : ouvre le navigateur Internet et saisis l'adresse indiquée ci-dessus. " +
            "Le PC HP n'a pas besoin de rester allumé. Les deux appareils doivent être sur le même réseau local.", 19, 0xffcad6e6));
        root.addView(text("Laisse le boîtier allumé pour cet essai. S'il passe en veille profonde, Android peut interrompre le relais. " +
            "Ne publie pas ta MAC ni ton portail dans ce laboratoire.", 17, 0xffedc69c));
        setContentView(scroll);
        start.requestFocus();
    }

    @Override protected void onResume() {
        super.onResume();
        handler.removeCallbacks(refresh);
        handler.post(refresh);
    }
    @Override protected void onPause() {
        handler.removeCallbacks(refresh);
        super.onPause();
    }

    private void updateStatus() {
        List<String> ips = localIpv4();
        StringBuilder str = new StringBuilder();
        if (RelayService.isRunning()) str.append("SERVEUR ACTIF : port 8784\n\n");
        else str.append("SERVEUR ARRÊTÉ : appuie sur DÉMARRER LE RELAIS LOCAL\n\n");
        if (ips.isEmpty()) str.append("Aucune adresse IP privée détectée. Vérifie le Wi-Fi ou l'Ethernet du boîtier.");
        else {
            str.append("Adresse(s) à ouvrir sur la HISENSE :\n");
            for (String ip : ips) str.append("http://").append(ip).append(":8784/\n");
            str.append("\nTest JSON : ajoute /health à l'adresse sans le / final.");
        }
        String error = RelayService.getLastError();
        if (!error.isEmpty()) str.append("\n\nErreur : ").append(error);
        info.setText(str.toString());
        info.setTextColor(RelayService.isRunning() ? 0xff79e7b2 : Color.WHITE);
    }

    private static List<String> localIpv4() {
        List<String> wifi = new ArrayList<>(), other = new ArrayList<>();
        try {
            Enumeration<NetworkInterface> interfaces = NetworkInterface.getNetworkInterfaces();
            if (interfaces == null) return wifi;
            for (NetworkInterface network : Collections.list(interfaces)) {
                if (!network.isUp() || network.isLoopback()) continue;
                Enumeration<InetAddress> addresses = network.getInetAddresses();
                for (InetAddress address : Collections.list(addresses)) {
                    if (!(address instanceof Inet4Address)) continue;
                    byte[] b = address.getAddress();
                    int a = b[0] & 255, c = b[1] & 255;
                    if (!(a == 10 || a == 172 && c >= 16 && c <= 31 || a == 192 && c == 168)) continue;
                    String ip = address.getHostAddress();
                    if (network.getName().startsWith("wlan") || network.getName().startsWith("eth")) wifi.add(ip);
                    else other.add(ip);
                }
            }
        } catch (Exception ignored) { }
        wifi.addAll(other);
        return wifi;
    }

    private TextView text(String content, int size, int color) {
        TextView text = new TextView(this);
        text.setText(content);
        text.setTextColor(color);
        text.setTextSize(size);
        text.setGravity(Gravity.CENTER_VERTICAL);
        text.setPadding(0, dp(9), 0, dp(9));
        return text;
    }
    private Button button(String caption) {
        Button button = new Button(this);
        button.setText(caption);
        button.setAllCaps(false);
        button.setTextSize(21);
        button.setFocusable(true);
        button.setMinHeight(dp(72));
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        params.bottomMargin = dp(14);
        button.setLayoutParams(params);
        return button;
    }
    private int dp(int count) { return (int) (count * getResources().getDisplayMetrics().density + .5f); }
}
