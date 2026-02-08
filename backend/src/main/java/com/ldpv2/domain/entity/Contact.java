package com.ldpv2.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;

/**
 * Contact entity representing functional roles with associated persons
 */
@Data
@Entity
@Table(name = "contact")
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true, exclude = {"contactPersons"})
public class Contact extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contact_role_id", nullable = false)
    private ContactRole contactRole;

    @OneToMany(mappedBy = "contact", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ContactPerson> contactPersons = new HashSet<>();

    public void addPerson(Person person, boolean isPrimary) {
        ContactPerson contactPerson = new ContactPerson();
        contactPerson.setContact(this);
        contactPerson.setPerson(person);
        contactPerson.setPrimary(isPrimary);
        contactPersons.add(contactPerson);
    }

    public void removePerson(Person person) {
        contactPersons.removeIf(cp -> cp.getPerson().equals(person));
    }
}
