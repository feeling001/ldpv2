package com.ldpv2.repository;

import com.ldpv2.domain.entity.Application;
import com.ldpv2.domain.enums.ApplicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, UUID> {
    Page<Application> findByStatus(ApplicationStatus status, Pageable pageable);
    Page<Application> findByBusinessUnitId(UUID businessUnitId, Pageable pageable);
    Page<Application> findByNameContainingIgnoreCase(String name, Pageable pageable);
    Page<Application> findByStatusAndBusinessUnitId(ApplicationStatus status, UUID businessUnitId, Pageable pageable);
    
    @Query("SELECT a FROM Application a WHERE " +
           "(:status IS NULL OR a.status = :status) AND " +
           "(:businessUnitId IS NULL OR a.businessUnit.id = :businessUnitId) AND " +
           "(:name IS NULL OR LOWER(a.name) LIKE LOWER(CONCAT('%', :name, '%')))")
    Page<Application> search(
        @Param("status") ApplicationStatus status,
        @Param("businessUnitId") UUID businessUnitId,
        @Param("name") String name,
        Pageable pageable
    );
}
