package com.ldpv2.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VersionSummaryResponse {
    private UUID id;
    private String versionIdentifier;
    private LocalDate releaseDate;
}
