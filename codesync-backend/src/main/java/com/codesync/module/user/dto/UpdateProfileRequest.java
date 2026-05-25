package com.codesync.module.user.dto;

import lombok.Data;

@Data
public class UpdateProfileRequest {

    private String username;
    private String avatarUrl;
}
