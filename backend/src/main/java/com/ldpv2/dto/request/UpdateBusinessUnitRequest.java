package com.ldpv2.dto.request;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateBusinessUnitRequest {
    
    @Size(max = 255, message = "Name must not exceed 255 characters")
    private String name;
    
    private String description;
}
