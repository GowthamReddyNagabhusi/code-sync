package com.codesync.module.editor.interceptor;

import com.codesync.module.auth.service.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Map;

/**
 * Extracts JWT from the WebSocket handshake query parameter
 * and stores the authenticated email in the session attributes.
 *
 * Usage: ws://localhost:8080/ws/editor?token=<JWT>&roomCode=<CODE>
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtHandshakeInterceptor implements HandshakeInterceptor {

    private final JwtUtil jwtUtil;

    @Override
    public boolean beforeHandshake(
            ServerHttpRequest request,
            ServerHttpResponse response,
            WebSocketHandler wsHandler,
            Map<String, Object> attributes) {

        var params = UriComponentsBuilder.fromUri(request.getURI())
                .build().getQueryParams();

        String token = params.getFirst("token");
        String roomCode = params.getFirst("roomCode");

        if (token == null || roomCode == null) {
            log.warn("WebSocket handshake rejected: missing token or roomCode");
            return false;
        }

        if (!jwtUtil.isTokenValid(token)) {
            log.warn("WebSocket handshake rejected: invalid JWT");
            return false;
        }

        String email = jwtUtil.extractEmail(token);
        attributes.put("email", email);
        attributes.put("roomCode", roomCode);

        log.debug("WebSocket handshake approved for {} in room {}", email, roomCode);
        return true;
    }

    @Override
    public void afterHandshake(
            ServerHttpRequest request,
            ServerHttpResponse response,
            WebSocketHandler wsHandler,
            Exception exception) {
        // no-op
    }
}
