package com.ldpv2.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeploymentResponse {
    private UUID id;
    private ApplicationSummaryResponse application;
    private VersionSummaryResponse version;
    private EnvironmentSummaryResponse environment;
    private LocalDateTime deploymentDate;
    private String deployedBy;
    private String notes;
    private LocalDateTime createdAt;
}
