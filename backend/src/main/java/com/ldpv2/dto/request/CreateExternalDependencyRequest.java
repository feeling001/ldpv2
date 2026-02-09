package com.ldpv2.dto.request;

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
public class CreateExternalDependencyRequest {
    
    @NotNull(message = "Dependency type is required")
    private UUID dependencyTypeId;
    
    @NotBlank(message = "Name is required")
    @Size(max = 255, message = "Name must not exceed 255 characters")
    private String name;
    
    private String description;
    
    private String technicalDocumentation;
    
    private LocalDate validityStartDate;
    
    private LocalDate validityEndDate;
}
