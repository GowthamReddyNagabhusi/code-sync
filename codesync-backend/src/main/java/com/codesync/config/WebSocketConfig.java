package com.codesync.config;

import com.codesync.module.editor.handler.EditorWebSocketHandler;
import com.codesync.module.editor.interceptor.JwtHandshakeInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketConfigurer {

    private final EditorWebSocketHandler editorHandler;
    private final JwtHandshakeInterceptor jwtInterceptor;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(editorHandler, "/ws/editor")
                .addInterceptors(jwtInterceptor)
                .setAllowedOrigins("*"); // TODO: restrict in production
    }
}
