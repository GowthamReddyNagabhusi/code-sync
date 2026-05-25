package com.codesync.module.editor.pubsub;

import com.codesync.module.editor.dto.EditorMessage;
import com.codesync.module.editor.handler.EditorWebSocketHandler;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class EditorRedisSubscriber implements MessageListener {

    private final ObjectMapper objectMapper;
    private final EditorWebSocketHandler webSocketHandler;

    @Override
    public void onMessage(Message message, byte[] pattern) {
        try {
            String payload = new String(message.getBody());
            EditorMessage editorMessage = objectMapper.readValue(payload, EditorMessage.class);

            String roomCode = editorMessage.getRoomCode();
            log.debug("Received Redis message for room {}", roomCode);

            // Forward to local WebSocket sessions
            webSocketHandler.handleRedisMessage(roomCode, editorMessage);
        } catch (Exception e) {
            log.error("Failed to process Redis message", e);
        }
    }
}
