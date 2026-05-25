package com.codesync.module.editor.pubsub;

import com.codesync.module.editor.dto.EditorMessage;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class EditorRedisPublisher {

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    private static final String CHANNEL_PREFIX = "room:";
    private static final String CHANNEL_SUFFIX = ":edits";

    /**
     * Publish an editor message to the Redis channel for the given room.
     */
    public void publish(String roomCode, EditorMessage message) {
        try {
            String channel = CHANNEL_PREFIX + roomCode + CHANNEL_SUFFIX;
            String payload = objectMapper.writeValueAsString(message);
            redisTemplate.convertAndSend(channel, payload);
            log.debug("Published to Redis channel {}", channel);
        } catch (Exception e) {
            log.error("Failed to publish to Redis for room {}", roomCode, e);
        }
    }
}
