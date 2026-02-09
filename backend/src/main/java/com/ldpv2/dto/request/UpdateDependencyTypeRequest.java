package com.ldpv2.dto.request;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateDependencyTypeRequest {
    
    @Size(max = 100, message = "Type name must not exceed 100 characters")
    private String typeName;
    
    private String description;
}
