package com.ldpv2.dto.response;

import com.ldpv2.domain.enums.ApplicationStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationSummaryResponse {
    private UUID id;
    private String name;
    private ApplicationStatus status;
    private String businessUnitName;
}
