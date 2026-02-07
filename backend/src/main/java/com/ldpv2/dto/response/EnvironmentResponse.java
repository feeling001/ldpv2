package com.ldpv2.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EnvironmentResponse {
    private UUID id;
    private String name;
    private String description;
    private Boolean isProduction;
    private Integer criticalityLevel;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
