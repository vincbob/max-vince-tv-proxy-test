package fr.maxvince.relay;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.os.Build;
import android.os.IBinder;

/** Foreground service: keeps diagnostic local HTTP endpoint active while UI is closed. */
public final class RelayService extends Service {
    private static final String CHANNEL_ID = "max_tv_relay_status";
    private static final int NOTIFICATION_ID = 8784;
    private static volatile boolean running = false;
    private static volatile String lastError = "";
    private LocalRelayServer server;

    public static boolean isRunning() { return running; }
    public static String getLastError() { return lastError; }

    @Override public int onStartCommand(Intent intent, int flags, int startId) {
        if (server != null && server.isRunning()) return START_STICKY;
        showForegroundNotification();
        try {
            server = new LocalRelayServer();
            server.start();
            running = true;
            lastError = "";
            return START_STICKY;
        } catch (Exception e) {
            running = false;
            lastError = "Impossible d'ouvrir le port 8784. Vérifie qu'il n'est pas déjà utilisé.";
            stopSelf();
            return START_NOT_STICKY;
        }
    }

    private void showForegroundNotification() {
        NotificationManager manager = (NotificationManager)getSystemService(NOTIFICATION_SERVICE);
        if (Build.VERSION.SDK_INT >= 26) {
            manager.createNotificationChannel(new NotificationChannel(
                CHANNEL_ID, "MAX TV : relais local", NotificationManager.IMPORTANCE_LOW));
        }
        Intent launch = new Intent(this, MainActivity.class);
        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= 23) flags |= PendingIntent.FLAG_IMMUTABLE;
        PendingIntent pending = PendingIntent.getActivity(this, 0, launch, flags);
        Notification.Builder builder = Build.VERSION.SDK_INT >= 26
            ? new Notification.Builder(this, CHANNEL_ID) : new Notification.Builder(this);
        Notification n = builder.setSmallIcon(android.R.drawable.stat_sys_download_done)
            .setContentTitle("MAX TV RELAIS 01")
            .setContentText("Serveur local de diagnostic : port 8784")
            .setContentIntent(pending)
            .setOngoing(true)
            .build();
        startForeground(NOTIFICATION_ID, n);
    }

    @Override public void onDestroy() {
        if (server != null) { server.stop(); server = null; }
        running = false;
        super.onDestroy();
    }

    @Override public IBinder onBind(Intent intent) { return null; }
}
