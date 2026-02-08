package com.ldpv2.domain.entity;

import com.ldpv2.domain.enums.ApplicationStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

/**
 * Application entity representing software systems
 */
@Data
@Entity
@Table(name = "application")
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true, exclude = {"applicationContacts"})
public class Application extends BaseEntity {

    @Column(nullable = false, length = 255)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private ApplicationStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_unit_id", nullable = false)
    private BusinessUnit businessUnit;

    @Column(name = "end_of_life_date")
    private LocalDate endOfLifeDate;

    @Column(name = "end_of_support_date")
    private LocalDate endOfSupportDate;

    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ApplicationContact> applicationContacts = new HashSet<>();

    public void addContact(Contact contact) {
        ApplicationContact appContact = new ApplicationContact();
        appContact.setApplication(this);
        appContact.setContact(contact);
        applicationContacts.add(appContact);
    }

    public void removeContact(Contact contact) {
        applicationContacts.removeIf(ac -> ac.getContact().equals(contact));
    }
}
