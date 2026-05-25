package com.codesync.module.editor.crdt;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;

/**
 * Represents a single character in the CRDT document.
 * Uses fractional indexing for position — each character's position
 * is a list of integers that defines its place in the sequence.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class CrdtChar implements Serializable, Comparable<CrdtChar> {

    private String siteId;       // unique ID of the user who created this char
    private int clock;           // logical clock at time of creation
    private List<Integer> position; // fractional position index
    private char value;
    private boolean deleted;     // tombstone flag

    /**
     * Unique identifier for this character across all replicas.
     */
    public String getUniqueId() {
        return siteId + ":" + clock;
    }

    @Override
    public int compareTo(CrdtChar other) {
        // Compare by fractional position
        int minLen = Math.min(this.position.size(), other.position.size());
        for (int i = 0; i < minLen; i++) {
            int cmp = Integer.compare(this.position.get(i), other.position.get(i));
            if (cmp != 0) return cmp;
        }
        // If one is a prefix of the other, shorter comes first
        int lenCmp = Integer.compare(this.position.size(), other.position.size());
        if (lenCmp != 0) return lenCmp;

        // Tie-break by siteId for deterministic ordering
        return this.siteId.compareTo(other.siteId);
    }
}
