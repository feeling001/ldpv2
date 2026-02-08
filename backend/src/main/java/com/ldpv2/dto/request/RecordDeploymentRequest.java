package com.ldpv2.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecordDeploymentRequest {
    
    @NotNull(message = "Application ID is required")
    private UUID applicationId;
    
    @NotNull(message = "Version ID is required")
    private UUID versionId;
    
    @NotNull(message = "Environment ID is required")
    private UUID environmentId;
    
    @NotNull(message = "Deployment date is required")
    private LocalDateTime deploymentDate;
    
    private String deployedBy;
    
    private String notes;
}
