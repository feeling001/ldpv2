package com.ldpv2.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * Junction entity for Contact-Person many-to-many relationship
 */
@Data
@Entity
@Table(name = "contact_person")
@NoArgsConstructor
@AllArgsConstructor
public class ContactPerson implements Serializable {

    @EmbeddedId
    private ContactPersonId id = new ContactPersonId();

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("contactId")
    @JoinColumn(name = "contact_id")
    private Contact contact;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("personId")
    @JoinColumn(name = "person_id")
    private Person person;

    @Column(name = "is_primary", nullable = false)
    private boolean isPrimary = false;

    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ContactPersonId implements Serializable {
        @Column(name = "contact_id")
        private java.util.UUID contactId;

        @Column(name = "person_id")
        private java.util.UUID personId;
    }
}
