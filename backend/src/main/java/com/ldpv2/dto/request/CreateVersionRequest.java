package com.ldpv2.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateVersionRequest {
    
    @NotBlank(message = "Version identifier is required")
    @Size(max = 100, message = "Version identifier must not exceed 100 characters")
    private String versionIdentifier;
    
    @Size(max = 500, message = "External reference must not exceed 500 characters")
    private String externalReference;
    
    @NotNull(message = "Release date is required")
    private LocalDate releaseDate;
    
    private LocalDate endOfLifeDate;
}
