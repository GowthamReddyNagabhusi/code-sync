package com.codesync.module.editor.dto;

import com.codesync.module.editor.crdt.CrdtChar;
import com.codesync.module.editor.crdt.CrdtOperation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * WebSocket message envelope.
 * Type determines how the payload is interpreted.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EditorMessage {

    public enum Type {
        EDIT,           // CRDT operation
        CURSOR_MOVE,    // cursor position update
        SYNC_REQUEST,   // new client requesting full document
        SYNC_RESPONSE,  // full document state sent to client
        USER_JOINED,    // notification: user joined the room
        USER_LEFT       // notification: user left the room
    }

    private Type type;
    private String roomCode;
    private String siteId;
    private String username;

    // For EDIT messages
    private CrdtOperation operation;

    // For CURSOR_MOVE messages
    private CursorPosition cursor;

    // For SYNC_RESPONSE messages
    private List<CrdtChar> documentState;
    private String documentText;
}
