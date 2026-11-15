package com.codesync.module.auth.service;

import com.codesync.common.exception.ApiException;
import com.codesync.module.auth.dto.AuthResponse;
import com.codesync.module.auth.dto.LoginRequest;
import com.codesync.module.auth.dto.RegisterRequest;
import com.codesync.module.user.entity.User;
import com.codesync.module.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    @Test
    void testRegisterSuccess() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("alice");
        request.setEmail("alice@codesync.io");
        request.setPassword("SecurePass123!");

        when(userRepository.existsByEmail("alice@codesync.io")).thenReturn(false);
        when(userRepository.existsByUsername("alice")).thenReturn(false);
        when(passwordEncoder.encode("SecurePass123!")).thenReturn("hashed-secret");
        when(jwtUtil.generateToken("alice@codesync.io")).thenReturn("mock-jwt-token");

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("alice", response.getUsername());
        assertEquals("alice@codesync.io", response.getEmail());
        assertEquals("mock-jwt-token", response.getAccessToken());

        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void testRegisterThrowsWhenEmailAlreadyExists() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("bob");
        request.setEmail("existing@codesync.io");
        request.setPassword("password");

        when(userRepository.existsByEmail("existing@codesync.io")).thenReturn(true);

        assertThrows(ApiException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testLoginSuccess() {
        LoginRequest request = new LoginRequest();
        request.setEmail("alice@codesync.io");
        request.setPassword("password");

        User user = User.builder()
                .username("alice")
                .email("alice@codesync.io")
                .password("hashed-secret")
                .build();

        when(userRepository.findByEmail("alice@codesync.io")).thenReturn(Optional.of(user));
        when(jwtUtil.generateToken("alice@codesync.io")).thenReturn("mock-jwt-token");

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("alice", response.getUsername());
        assertEquals("mock-jwt-token", response.getAccessToken());
        verify(authenticationManager, times(1)).authenticate(any());
    }
}
