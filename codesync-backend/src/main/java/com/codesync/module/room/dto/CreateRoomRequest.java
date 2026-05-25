package com.codesync.module.room.dto;

import lombok.Data;

@Data
public class CreateRoomRequest {

    private String name;
    private String language;
    private Integer maxMembers;
}
