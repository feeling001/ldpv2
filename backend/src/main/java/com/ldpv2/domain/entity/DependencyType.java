package com.ldpv2.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * Dependency Type entity - catalog of dependency types
 */
@Data
@Entity
@Table(name = "dependency_type")
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class DependencyType extends BaseEntity {

    @Column(name = "type_name", nullable = false, unique = true, length = 100)
    private String typeName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_custom", nullable = false)
    private Boolean isCustom = false;
}
