package com.codesync.module.room.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RoomMemberResponse {

    private Long userId;
    private String username;
    private String email;
    private String avatarUrl;
    private String role;
    private LocalDateTime joinedAt;
}
