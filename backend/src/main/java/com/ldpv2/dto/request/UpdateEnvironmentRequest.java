package com.ldpv2.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateEnvironmentRequest {
    
    @Size(max = 100, message = "Name must not exceed 100 characters")
    private String name;
    
    private String description;
    
    private Boolean isProduction;
    
    @Min(value = 1, message = "Criticality level must be between 1 and 5")
    @Max(value = 5, message = "Criticality level must be between 1 and 5")
    private Integer criticalityLevel;
}
