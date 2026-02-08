package com.ldpv2.dto.request;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateVersionRequest {
    
    @Size(max = 100, message = "Version identifier must not exceed 100 characters")
    private String versionIdentifier;
    
    @Size(max = 500, message = "External reference must not exceed 500 characters")
    private String externalReference;
    
    private LocalDate releaseDate;
    
    private LocalDate endOfLifeDate;
}
