package fr.maxvince.relay;
import org.junit.Test;
import static org.junit.Assert.*;
import java.nio.charset.StandardCharsets;

public final class RelayProtocolTest {
    @Test public void healthIsSafeAndReadOnly() {
        RelayProtocol.Reply reply = RelayProtocol.route("GET /health HTTP/1.1");
        assertEquals(200, reply.status);
        String body = new String(reply.bytes, StandardCharsets.UTF_8);
        assertTrue(body.contains("\"status\":\"ok\""));
        assertTrue(body.contains("\"iptv_enabled\":false"));
        assertFalse(body.contains("token"));
    }
    @Test public void showsHttpHomeOnTv() {
        RelayProtocol.Reply reply = RelayProtocol.route("GET / HTTP/1.1");
        assertEquals(200, reply.status);
        assertTrue(new String(reply.bytes, StandardCharsets.UTF_8).contains("CONNEXION LOCALE RÉUSSIE"));
        assertTrue(reply.type.contains("text/html"));
    }
    @Test public void headDoesNotReturnBody() {
        RelayProtocol.Reply reply = RelayProtocol.route("HEAD /health HTTP/1.1");
        assertEquals(200, reply.status);
        assertFalse(reply.sendBody);
    }
    @Test public void postIsDenied() {
        RelayProtocol.Reply reply = RelayProtocol.route("POST /health HTTP/1.1");
        assertEquals(405, reply.status);
    }
    @Test public void unknownRouteIsDenied() {
        RelayProtocol.Reply reply = RelayProtocol.route("GET /settings HTTP/1.1");
        assertEquals(404, reply.status);
    }
    @Test public void malformedRequestIsRejected() {
        assertEquals(400, RelayProtocol.route("abc").status);
        assertEquals(400, RelayProtocol.route(null).status);
    }
}
