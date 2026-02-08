package com.ldpv2.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VersionResponse {
    private UUID id;
    private UUID applicationId;
    private String applicationName;
    private String versionIdentifier;
    private String externalReference;
    private LocalDate releaseDate;
    private LocalDate endOfLifeDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
