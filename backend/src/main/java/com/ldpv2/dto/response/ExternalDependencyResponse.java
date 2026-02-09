package com.ldpv2.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExternalDependencyResponse {
    private UUID id;
    private ApplicationSummaryResponse application;
    private DependencyTypeResponse dependencyType;
    private String name;
    private String description;
    private String technicalDocumentation;
    private LocalDate validityStartDate;
    private LocalDate validityEndDate;
    private Boolean isActive;
    private Integer daysUntilExpiration;
    private String status; // ACTIVE, EXPIRING, EXPIRED, NOT_YET_VALID
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
