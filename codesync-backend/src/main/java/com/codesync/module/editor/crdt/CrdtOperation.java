package com.codesync.module.editor.crdt;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * Represents a single CRDT operation (insert or delete).
 * These operations are broadcast to all peers for convergence.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class CrdtOperation implements Serializable {

    public enum Type {
        INSERT, DELETE
    }

    private Type type;
    private CrdtChar character;
    private String roomCode;
    private String siteId;
    private long timestamp;
}
