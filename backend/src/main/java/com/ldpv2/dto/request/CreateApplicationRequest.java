package com.ldpv2.dto.request;

import com.ldpv2.domain.enums.ApplicationStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateApplicationRequest {
    
    @NotBlank(message = "Name is required")
    @Size(max = 255, message = "Name must not exceed 255 characters")
    private String name;
    
    private String description;
    
    @NotNull(message = "Status is required")
    private ApplicationStatus status;
    
    @NotNull(message = "Business unit is required")
    private UUID businessUnitId;
    
    private LocalDate endOfLifeDate;
    
    private LocalDate endOfSupportDate;
}
