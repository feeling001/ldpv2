package com.ldpv2.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Deployment entity - immutable record of deployments
 * Tracks which version of which application is deployed to which environment
 */
@Data
@Entity
@Table(name = "deployment")
@NoArgsConstructor @AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Deployment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private Application application;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "version_id", nullable = false)
    private Version version;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "environment_id", nullable = false)
    private Environment environment;

    @Column(name = "deployment_date", nullable = false)
    private LocalDateTime deploymentDate;

    @Column(name = "deployed_by", length = 255)
    private String deployedBy;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
