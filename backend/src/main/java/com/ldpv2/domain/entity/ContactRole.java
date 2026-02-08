package com.ldpv2.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * Contact Role entity representing functional roles
 */
@Data
@Entity
@Table(name = "contact_role")
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class ContactRole extends BaseEntity {

    @Column(name = "role_name", nullable = false, unique = true, length = 100)
    private String roleName;

    @Column(columnDefinition = "TEXT")
    private String description;
}
