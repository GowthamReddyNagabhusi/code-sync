package com.codesync.module.editor.crdt;

import java.util.*;
import java.util.concurrent.ConcurrentSkipListSet;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * A CRDT document based on a simplified RGA (Replicated Growable Array).
 * 
 * Characters are stored in a sorted set ordered by their fractional position.
 * Insert and delete operations are commutative and idempotent, guaranteeing
 * convergence across replicas regardless of operation order.
 */
public class CrdtDocument {

    private final ConcurrentSkipListSet<CrdtChar> characters = new ConcurrentSkipListSet<>();
    private final String siteId;
    private final AtomicInteger clock = new AtomicInteger(0);

    // Boundaries for fractional indexing
    private static final int BASE = 256;

    public CrdtDocument(String siteId) {
        this.siteId = siteId;
    }

    /**
     * Generate a position between two existing positions.
     */
    private List<Integer> generatePositionBetween(List<Integer> before, List<Integer> after) {
        List<Integer> newPos = new ArrayList<>();
        int maxLen = Math.max(
                before != null ? before.size() : 0,
                after != null ? after.size() : 0
        ) + 1;

        for (int i = 0; i < maxLen; i++) {
            int b = (before != null && i < before.size()) ? before.get(i) : 0;
            int a = (after != null && i < after.size()) ? after.get(i) : BASE;

            if (b + 1 < a) {
                // There's room between — pick midpoint
                newPos.add(b + (a - b) / 2);
                return newPos;
            } else {
                newPos.add(b);
            }
        }

        // Append a new level
        newPos.add(BASE / 2);
        return newPos;
    }

    /**
     * Insert a character at the given index in the visible text.
     */
    public CrdtOperation localInsert(int index, char value) {
        List<CrdtChar> visible = getVisibleChars();

        List<Integer> posBefore = (index > 0) ? visible.get(index - 1).getPosition() : null;
        List<Integer> posAfter = (index < visible.size()) ? visible.get(index).getPosition() : null;

        List<Integer> newPos = generatePositionBetween(posBefore, posAfter);

        CrdtChar ch = new CrdtChar(siteId, clock.incrementAndGet(), newPos, value, false);
        characters.add(ch);

        CrdtOperation op = new CrdtOperation();
        op.setType(CrdtOperation.Type.INSERT);
        op.setCharacter(ch);
        op.setSiteId(siteId);
        op.setTimestamp(System.currentTimeMillis());

        return op;
    }

    /**
     * Delete the character at the given index in the visible text.
     */
    public CrdtOperation localDelete(int index) {
        List<CrdtChar> visible = getVisibleChars();

        if (index < 0 || index >= visible.size()) {
            return null;
        }

        CrdtChar ch = visible.get(index);
        ch.setDeleted(true);

        CrdtOperation op = new CrdtOperation();
        op.setType(CrdtOperation.Type.DELETE);
        op.setCharacter(ch);
        op.setSiteId(siteId);
        op.setTimestamp(System.currentTimeMillis());

        return op;
    }

    /**
     * Apply a remote operation received from another peer.
     */
    public void applyRemote(CrdtOperation op) {
        if (op.getType() == CrdtOperation.Type.INSERT) {
            // Idempotent: if already present, skip
            characters.add(op.getCharacter());
        } else if (op.getType() == CrdtOperation.Type.DELETE) {
            // Find the matching char and mark deleted
            for (CrdtChar ch : characters) {
                if (ch.getUniqueId().equals(op.getCharacter().getUniqueId())) {
                    ch.setDeleted(true);
                    break;
                }
            }
        }
    }

    /**
     * Get the current document text (visible characters only).
     */
    public String getText() {
        StringBuilder sb = new StringBuilder();
        for (CrdtChar ch : characters) {
            if (!ch.isDeleted()) {
                sb.append(ch.getValue());
            }
        }
        return sb.toString();
    }

    /**
     * Get visible (non-deleted) characters in order.
     */
    private List<CrdtChar> getVisibleChars() {
        List<CrdtChar> visible = new ArrayList<>();
        for (CrdtChar ch : characters) {
            if (!ch.isDeleted()) {
                visible.add(ch);
            }
        }
        return visible;
    }

    /**
     * Get all characters (including tombstones) for sync.
     */
    public List<CrdtChar> getAllChars() {
        return new ArrayList<>(characters);
    }

    /**
     * Rebuild document from a full character list (for initial sync).
     */
    public void loadFrom(List<CrdtChar> chars) {
        characters.clear();
        characters.addAll(chars);
    }
}
