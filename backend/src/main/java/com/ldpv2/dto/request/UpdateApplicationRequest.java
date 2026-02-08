package com.ldpv2.dto.request;

import com.ldpv2.domain.enums.ApplicationStatus;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateApplicationRequest {
    
    @Size(max = 255, message = "Name must not exceed 255 characters")
    private String name;
    
    private String description;
    
    private ApplicationStatus status;
    
    private UUID businessUnitId;
    
    private LocalDate endOfLifeDate;
    
    private LocalDate endOfSupportDate;
}
