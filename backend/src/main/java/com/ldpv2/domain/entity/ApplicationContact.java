package com.ldpv2.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * Junction entity linking Applications to Contacts
 */
@Data
@Entity
@Table(name = "application_contact")
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationContact implements Serializable {

    @EmbeddedId
    private ApplicationContactId id = new ApplicationContactId();

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("applicationId")
    @JoinColumn(name = "application_id")
    private Application application;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("contactId")
    @JoinColumn(name = "contact_id")
    private Contact contact;

    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ApplicationContactId implements Serializable {
        @Column(name = "application_id")
        private java.util.UUID applicationId;

        @Column(name = "contact_id")
        private java.util.UUID contactId;
    }
}
