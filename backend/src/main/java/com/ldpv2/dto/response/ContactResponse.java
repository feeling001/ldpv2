package com.ldpv2.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContactResponse {
    private UUID id;
    private ContactRoleResponse contactRole;
    private List<PersonInContactResponse> persons;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
