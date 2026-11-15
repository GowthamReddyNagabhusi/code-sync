package com.codesync.module.room.util;

import com.codesync.module.room.repository.RoomRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RoomCodeGeneratorTest {

    @Mock
    private RoomRepository roomRepository;

    @InjectMocks
    private RoomCodeGenerator codeGenerator;

    @Test
    void testGenerateProducesValidEightCharacterCode() {
        when(roomRepository.existsByRoomCode(anyString())).thenReturn(false);

        String code = codeGenerator.generate();

        assertNotNull(code);
        assertEquals(8, code.length());
        assertTrue(code.matches("^[A-Z0-9]{8}$"));
    }

    @Test
    void testGeneratedCodeExcludesAmbiguousCharacters() {
        when(roomRepository.existsByRoomCode(anyString())).thenReturn(false);

        for (int i = 0; i < 20; i++) {
            String code = codeGenerator.generate();
            assertFalse(code.contains("0"), "Code should not contain digit 0");
            assertFalse(code.contains("O"), "Code should not contain letter O");
            assertFalse(code.contains("1"), "Code should not contain digit 1");
            assertFalse(code.contains("I"), "Code should not contain letter I");
        }
    }
}
