package com.ldpv2.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Version entity representing application releases
 */
@Data
@Entity
@Table(name = "version", uniqueConstraints = {
    @UniqueConstraint(name = "uk_version_app_identifier", 
                     columnNames = {"application_id", "version_identifier"})
})
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Version extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private Application application;

    @Column(name = "version_identifier", nullable = false, length = 100)
    private String versionIdentifier;

    @Column(name = "external_reference", length = 500)
    private String externalReference;

    @Column(name = "release_date", nullable = false)
    private LocalDate releaseDate;

    @Column(name = "end_of_life_date")
    private LocalDate endOfLifeDate;
}
