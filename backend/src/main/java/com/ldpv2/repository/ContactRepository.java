package com.ldpv2.repository;

import com.ldpv2.domain.entity.Contact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ContactRepository extends JpaRepository<Contact, UUID> {
    
    @Query("SELECT c FROM Contact c JOIN FETCH c.contactRole LEFT JOIN FETCH c.contactPersons cp LEFT JOIN FETCH cp.person")
    List<Contact> findAllWithDetails();
    
    @Query("SELECT c FROM Contact c JOIN FETCH c.contactRole LEFT JOIN FETCH c.contactPersons cp LEFT JOIN FETCH cp.person WHERE c.id = :id")
    Contact findByIdWithDetails(UUID id);
}
