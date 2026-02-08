package com.ldpv2.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PersonInContactResponse {
    private PersonResponse person;
    private boolean isPrimary;
}
