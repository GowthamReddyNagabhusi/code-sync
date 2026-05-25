package com.codesync.module.editor.handler;

import com.codesync.module.editor.crdt.CrdtDocument;
import com.codesync.module.editor.dto.EditorMessage;
import com.codesync.module.editor.pubsub.EditorRedisPublisher;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
@RequiredArgsConstructor
public class EditorWebSocketHandler extends TextWebSocketHandler {

    private final ObjectMapper objectMapper;
    private final EditorRedisPublisher redisPublisher;

    // roomCode -> Set of active sessions
    private final Map<String, Set<WebSocketSession>> roomSessions = new ConcurrentHashMap<>();

    // roomCode -> CRDT document
    private final Map<String, CrdtDocument> roomDocuments = new ConcurrentHashMap<>();

    // Cursor colors for users
    private static final String[] CURSOR_COLORS = {
            "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4",
            "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F",
            "#BB8FCE", "#85C1E9"
    };

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String roomCode = (String) session.getAttributes().get("roomCode");
        String email = (String) session.getAttributes().get("email");

        roomSessions.computeIfAbsent(roomCode, k -> ConcurrentHashMap.newKeySet()).add(session);
        roomDocuments.computeIfAbsent(roomCode, k -> new CrdtDocument("server"));

        // Assign cursor color
        int colorIndex = roomSessions.get(roomCode).size() % CURSOR_COLORS.length;
        session.getAttributes().put("cursorColor", CURSOR_COLORS[colorIndex]);

        log.info("WebSocket connected: {} in room {} (total: {})",
                email, roomCode, roomSessions.get(roomCode).size());

        // Send current document state to new client
        CrdtDocument doc = roomDocuments.get(roomCode);
        EditorMessage syncMsg = EditorMessage.builder()
                .type(EditorMessage.Type.SYNC_RESPONSE)
                .roomCode(roomCode)
                .documentState(doc.getAllChars())
                .documentText(doc.getText())
                .build();

        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(syncMsg)));

        // Notify others
        EditorMessage joinMsg = EditorMessage.builder()
                .type(EditorMessage.Type.USER_JOINED)
                .roomCode(roomCode)
                .username(email)
                .build();
        broadcastToRoom(roomCode, joinMsg, session);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String roomCode = (String) session.getAttributes().get("roomCode");
        String email = (String) session.getAttributes().get("email");

        EditorMessage msg = objectMapper.readValue(message.getPayload(), EditorMessage.class);
        msg.setRoomCode(roomCode);

        switch (msg.getType()) {
            case EDIT -> handleEdit(session, roomCode, msg);
            case CURSOR_MOVE -> handleCursorMove(session, roomCode, email, msg);
            case SYNC_REQUEST -> handleSyncRequest(session, roomCode);
            default -> log.warn("Unknown message type: {}", msg.getType());
        }
    }

    private void handleEdit(WebSocketSession session, String roomCode, EditorMessage msg) {
        CrdtDocument doc = roomDocuments.get(roomCode);
        if (doc != null && msg.getOperation() != null) {
            doc.applyRemote(msg.getOperation());
        }

        // Broadcast to local room sessions
        broadcastToRoom(roomCode, msg, session);

        // Publish to Redis for multi-instance support
        redisPublisher.publish(roomCode, msg);
    }

    private void handleCursorMove(WebSocketSession session, String roomCode,
                                   String email, EditorMessage msg) {
        if (msg.getCursor() != null) {
            msg.getCursor().setUserId(email);
            msg.getCursor().setColor((String) session.getAttributes().get("cursorColor"));
        }
        broadcastToRoom(roomCode, msg, session);
    }

    private void handleSyncRequest(WebSocketSession session, String roomCode) throws IOException {
        CrdtDocument doc = roomDocuments.get(roomCode);
        if (doc != null) {
            EditorMessage syncMsg = EditorMessage.builder()
                    .type(EditorMessage.Type.SYNC_RESPONSE)
                    .roomCode(roomCode)
                    .documentState(doc.getAllChars())
                    .documentText(doc.getText())
                    .build();
            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(syncMsg)));
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        String roomCode = (String) session.getAttributes().get("roomCode");
        String email = (String) session.getAttributes().get("email");

        Set<WebSocketSession> sessions = roomSessions.get(roomCode);
        if (sessions != null) {
            sessions.remove(session);
            if (sessions.isEmpty()) {
                roomSessions.remove(roomCode);
                // Keep document in memory for reconnects (could add TTL later)
            }
        }

        log.info("WebSocket disconnected: {} from room {}", email, roomCode);

        // Notify others
        EditorMessage leaveMsg = EditorMessage.builder()
                .type(EditorMessage.Type.USER_LEFT)
                .roomCode(roomCode)
                .username(email)
                .build();
        broadcastToRoom(roomCode, leaveMsg, null);
    }

    /**
     * Broadcast to all sessions in a room except the sender.
     */
    public void broadcastToRoom(String roomCode, EditorMessage msg, WebSocketSession exclude) {
        Set<WebSocketSession> sessions = roomSessions.get(roomCode);
        if (sessions == null) return;

        String payload;
        try {
            payload = objectMapper.writeValueAsString(msg);
        } catch (Exception e) {
            log.error("Failed to serialize message", e);
            return;
        }

        for (WebSocketSession s : sessions) {
            if (s.isOpen() && (exclude == null || !s.getId().equals(exclude.getId()))) {
                try {
                    s.sendMessage(new TextMessage(payload));
                } catch (IOException e) {
                    log.error("Failed to send message to session {}", s.getId(), e);
                }
            }
        }
    }

    /**
     * Apply a message from Redis (from another server instance).
     */
    public void handleRedisMessage(String roomCode, EditorMessage msg) {
        CrdtDocument doc = roomDocuments.get(roomCode);
        if (doc != null && msg.getOperation() != null) {
            doc.applyRemote(msg.getOperation());
        }
        broadcastToRoom(roomCode, msg, null);
    }
}
