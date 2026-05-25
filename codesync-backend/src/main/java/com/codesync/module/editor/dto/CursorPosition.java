package com.codesync.module.editor.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CursorPosition {

    private String userId;
    private String username;
    private int line;
    private int column;
    private String color;       // hex color assigned to this user
    private String roomCode;
}
