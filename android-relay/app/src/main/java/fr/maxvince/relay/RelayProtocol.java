package fr.maxvince.relay;

import java.nio.charset.StandardCharsets;

/** Pure Java: parse/route one HTTP request, no IPTV credentials or remote proxy. */
public final class RelayProtocol {
    private RelayProtocol() { }

    public static final class Reply {
        public final int status;
        public final String type;
        public final byte[] bytes;
        public final boolean sendBody;
        Reply(int status, String type, String body, boolean sendBody) {
            this.status = status;
            this.type = type;
            this.bytes = body.getBytes(StandardCharsets.UTF_8);
            this.sendBody = sendBody;
        }
    }

    public static Reply route(String requestLine) {
        if (requestLine == null || requestLine.length() > 2048) {
            return error(400, "Requête invalide");
        }
        String[] parts = requestLine.split(" ");
        if (parts.length != 3 || !parts[2].startsWith("HTTP/1.")) {
            return error(400, "Requête invalide");
        }
        String method = parts[0];
        if (!method.equals("GET") && !method.equals("HEAD")) {
            return error(405, "Méthode non autorisée");
        }
        boolean sendBody = !method.equals("HEAD");
        String path = parts[1];
        if ("/".equals(path) || "/index.html".equals(path)) {
            return new Reply(200, "text/html; charset=utf-8", html(), sendBody);
        }
        if ("/health".equals(path)) {
            return new Reply(200, "application/json; charset=utf-8",
                "{\"status\":\"ok\",\"application\":\"MAX TV RELAIS ANDROID 01\",\"version\":\"0.1.0\",\"mode\":\"local-test\",\"iptv_enabled\":false}", sendBody);
        }
        return error(404, "Page introuvable");
    }

    private static Reply error(int status, String reason) {
        return new Reply(status, "text/plain; charset=utf-8", reason + "\n", true);
    }

    private static String html() {
        return "<!doctype html><html lang=\"fr\"><head><meta charset=\"utf-8\">"
            + "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">"
            + "<title>MAX TV RELAIS ANDROID 01</title>"
            + "<style>body{margin:0;background:#101826;color:#f7f8fb;font:22px Arial,sans-serif;padding:34px}"
            + "h1{color:#ffa65c}main{max-width:900px;margin:auto;padding:24px;background:#1d2b3d;border-radius:16px}"
            + "strong{color:#79ebac}p{line-height:1.5}code{color:#fbc7a5}</style></head>"
            + "<body><main><h1>MAX TV RELAIS ANDROID 01</h1>"
            + "<p><strong>CONNEXION LOCALE RÉUSSIE</strong></p>"
            + "<p>Cette page est hébergée par ton boîtier Android, et non par ton PC ni par GitHub Pages.</p>"
            + "<p>Le réseau local entre le boîtier et le navigateur de ta Hisense fonctionne.</p>"
            + "<p>Étape 01 : diagnostic seulement. Aucun portail, aucune MAC et aucun flux IPTV n'est utilisé.</p>"
            + "<p>Diagnostic JSON : <code>/health</code></p></main></body></html>";
    }
}
