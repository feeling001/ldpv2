package com.ldpv2.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * Environment entity representing deployment targets
 */
@Data
@Entity
@Table(name = "environment")
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Environment extends BaseEntity {

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_production", nullable = false)
    private Boolean isProduction = false;

    @Column(name = "criticality_level")
    private Integer criticalityLevel;
}
