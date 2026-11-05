package fr.maxvince.relay;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.Inet4Address;
import java.net.InetAddress;
import java.net.ServerSocket;
import java.net.Socket;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

/** Minimal LAN-only read-only HTTP server for connection verification. */
public final class LocalRelayServer {
    public static final int PORT = 8784;
    private final ThreadPoolExecutor workers = new ThreadPoolExecutor(
        1, 3, 20, TimeUnit.SECONDS, new ArrayBlockingQueue<Runnable>(12));
    private volatile boolean running;
    private volatile ServerSocket listener;
    private Thread acceptThread;

    public synchronized void start() throws IOException {
        if (running) return;
        ServerSocket socket = new ServerSocket(PORT, 16, InetAddress.getByName("0.0.0.0"));
        socket.setReuseAddress(true);
        listener = socket;
        running = true;
        acceptThread = new Thread(new Runnable() {
            @Override public void run() { acceptLoop(); }
        }, "max-tv-relay-accept");
        acceptThread.setDaemon(true);
        acceptThread.start();
    }

    private void acceptLoop() {
        while (running) {
            Socket client;
            try { client = listener.accept(); }
            catch (IOException e) { if (running) running = false; break; }
            final Socket target = client;
            if (!isAllowed(client.getInetAddress())) { close(target); continue; }
            try {
                workers.execute(new Runnable() { @Override public void run() { serve(target); } });
            } catch (RuntimeException rejected) { close(target); }
        }
    }

    private static boolean isAllowed(InetAddress address) {
        if (address.isLoopbackAddress()) return true;
        if (!(address instanceof Inet4Address)) return false;
        byte[] b = address.getAddress();
        int a = b[0] & 255, c = b[1] & 255;
        return a == 10 || a == 172 && c >= 16 && c <= 31 || a == 192 && c == 168;
    }

    private void serve(Socket client) {
        try (Socket s = client) {
            s.setSoTimeout(5000);
            BufferedReader reader = new BufferedReader(
                new InputStreamReader(s.getInputStream(), StandardCharsets.US_ASCII));
            String requestLine = reader.readLine();
            if (requestLine != null && requestLine.length() > 2048) requestLine = null;
            RelayProtocol.Reply reply = RelayProtocol.route(requestLine);
            String reason = reply.status == 200 ? "OK" : reply.status == 404 ? "Not Found" :
                reply.status == 405 ? "Method Not Allowed" : "Bad Request";
            String headers = "HTTP/1.1 " + reply.status + " " + reason + "\r\n" +
                "Content-Type: " + reply.type + "\r\n" +
                "Content-Length: " + reply.bytes.length + "\r\n" +
                "Cache-Control: no-store\r\n" +
                "X-Content-Type-Options: nosniff\r\n" +
                "Connection: close\r\n\r\n";
            OutputStream out = s.getOutputStream();
            out.write(headers.getBytes(StandardCharsets.US_ASCII));
            if (reply.sendBody) out.write(reply.bytes);
            out.flush();
        } catch (IOException ignored) { /* Client may close early; no secrets logged. */ }
    }

    public synchronized void stop() {
        running = false;
        ServerSocket sock = listener;
        listener = null;
        if (sock != null) try { sock.close(); } catch (IOException ignored) { }
        workers.shutdownNow();
    }

    public boolean isRunning() { return running; }
    private static void close(Socket s) { try { s.close(); } catch (IOException ignored) { } }
}
