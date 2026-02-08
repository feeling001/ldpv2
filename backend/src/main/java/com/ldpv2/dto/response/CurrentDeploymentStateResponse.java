package com.ldpv2.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CurrentDeploymentStateResponse {
    private ApplicationSummaryResponse application;
    private EnvironmentSummaryResponse environment;
    private VersionSummaryResponse version;
    private LocalDateTime deploymentDate;
    private String deployedBy;
}
