package com.codesync.module.execution.dto;

import lombok.Data;

@Data
public class ExecuteRequest {

    private String code;
    private String language;    // java, python, cpp
    private String stdin;       // optional standard input
    private Long timeoutSeconds; // optional, defaults to 10s
}
