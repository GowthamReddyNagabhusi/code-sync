package com.codesync.module.room.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RoomResponse {

    private Long id;
    private String name;
    private String roomCode;
    private String language;
    private int maxMembers;
    private int currentMembers;
    private String ownerUsername;
    private LocalDateTime createdAt;
    private List<RoomMemberResponse> members;
}
