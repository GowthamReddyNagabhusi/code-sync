package com.codesync.module.auth.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {

    private JwtUtil jwtUtil;
    private static final String TEST_SECRET = "super-secure-secret-key-that-is-at-least-256-bits-long-for-testing-purposes";
    private static final long TEST_EXPIRATION = 3600000L; // 1 hour

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secret", TEST_SECRET);
        ReflectionTestUtils.setField(jwtUtil, "expiration", TEST_EXPIRATION);
    }

    @Test
    void testGenerateTokenAndExtractEmail() {
        String email = "developer@codesync.io";
        String token = jwtUtil.generateToken(email);

        assertNotNull(token);
        assertFalse(token.isBlank());

        String extracted = jwtUtil.extractEmail(token);
        assertEquals(email, extracted);
    }

    @Test
    void testIsTokenValidReturnsTrueForValidToken() {
        String token = jwtUtil.generateToken("test@example.com");
        assertTrue(jwtUtil.isTokenValid(token));
    }

    @Test
    void testIsTokenValidReturnsFalseForTamperedToken() {
        String token = jwtUtil.generateToken("test@example.com");
        String tampered = token + "corrupted";
        assertFalse(jwtUtil.isTokenValid(tampered));
    }

    @Test
    void testIsTokenValidReturnsFalseForNullOrBlank() {
        assertFalse(jwtUtil.isTokenValid(null));
        assertFalse(jwtUtil.isTokenValid(""));
    }
}
