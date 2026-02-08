package com.ldpv2.repository;

import com.ldpv2.domain.entity.ApplicationContact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ApplicationContactRepository extends JpaRepository<ApplicationContact, ApplicationContact.ApplicationContactId> {
    
    @Query("SELECT ac FROM ApplicationContact ac " +
           "JOIN FETCH ac.contact c " +
           "JOIN FETCH c.contactRole " +
           "LEFT JOIN FETCH c.contactPersons cp " +
           "LEFT JOIN FETCH cp.person " +
           "WHERE ac.application.id = :applicationId")
    List<ApplicationContact> findByApplicationIdWithDetails(UUID applicationId);
}
