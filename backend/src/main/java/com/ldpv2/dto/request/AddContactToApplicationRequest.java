package com.ldpv2.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddContactToApplicationRequest {
    @NotNull(message = "Contact ID is required")
    private UUID contactId;
}
