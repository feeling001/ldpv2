package com.ldpv2.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateContactRequest {
    
    @NotNull(message = "Contact role is required")
    private UUID contactRoleId;
    
    @NotEmpty(message = "At least one person is required")
    private List<UUID> personIds;
    
    @NotNull(message = "Primary person must be specified")
    private UUID primaryPersonId;
}
