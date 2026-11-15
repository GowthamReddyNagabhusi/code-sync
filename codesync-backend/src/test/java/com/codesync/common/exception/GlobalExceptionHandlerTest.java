package com.codesync.common.exception;

import com.codesync.common.dto.ApiError;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler exceptionHandler;

    @Mock
    private HttpServletRequest request;

    @BeforeEach
    void setUp() {
        exceptionHandler = new GlobalExceptionHandler();
        when(request.getRequestURI()).thenReturn("/api/test-endpoint");
    }

    @Test
    void testHandleApiExceptionReturnsCorrectStatus() {
        ApiException ex = ApiException.badRequest("Invalid input parameters");

        ResponseEntity<ApiError> response = exceptionHandler.handleApiException(ex, request);

        assertNotNull(response);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(400, response.getBody().getStatus());
        assertEquals("Invalid input parameters", response.getBody().getMessage());
        assertEquals("/api/test-endpoint", response.getBody().getPath());
    }

    @Test
    void testHandleBadCredentialsReturnsUnauthorized() {
        BadCredentialsException ex = new BadCredentialsException("Bad credentials");

        ResponseEntity<ApiError> response = exceptionHandler.handleBadCredentials(ex, request);

        assertNotNull(response);
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(401, response.getBody().getStatus());
        assertEquals("Invalid email or password", response.getBody().getMessage());
    }

    @Test
    void testHandleRuntimeReturnsInternalServerError() {
        RuntimeException ex = new RuntimeException("Unexpected database failure");

        ResponseEntity<ApiError> response = exceptionHandler.handleRuntime(ex, request);

        assertNotNull(response);
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(500, response.getBody().getStatus());
        assertEquals("Unexpected database failure", response.getBody().getMessage());
    }
}
