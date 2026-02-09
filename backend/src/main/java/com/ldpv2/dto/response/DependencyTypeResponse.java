package com.ldpv2.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DependencyTypeResponse {
    private UUID id;
    private String typeName;
    private String description;
    private Boolean isCustom;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
