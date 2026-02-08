package com.ldpv2.dto.response;

import com.ldpv2.domain.enums.ApplicationStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationResponse {
    private UUID id;
    private String name;
    private String description;
    private ApplicationStatus status;
    private BusinessUnitSummaryResponse businessUnit;
    private LocalDate endOfLifeDate;
    private LocalDate endOfSupportDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
