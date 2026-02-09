package com.ldpv2.repository;

import com.ldpv2.domain.entity.ExternalDependency;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface ExternalDependencyRepository extends JpaRepository<ExternalDependency, UUID> {
    
    Page<ExternalDependency> findByApplicationId(UUID applicationId, Pageable pageable);
    
    Page<ExternalDependency> findByDependencyTypeId(UUID dependencyTypeId, Pageable pageable);
    
    @Query("SELECT d FROM ExternalDependency d WHERE " +
           "d.validityEndDate IS NOT NULL AND " +
           "d.validityEndDate >= :now AND " +
           "d.validityEndDate <= :expirationDate")
    List<ExternalDependency> findExpiring(
        @Param("now") LocalDate now,
        @Param("expirationDate") LocalDate expirationDate
    );
    
    @Query("SELECT d FROM ExternalDependency d WHERE " +
           "d.validityEndDate IS NOT NULL AND " +
           "d.validityEndDate < :now")
    List<ExternalDependency> findExpired(@Param("now") LocalDate now);
    
    @Query("SELECT d FROM ExternalDependency d WHERE " +
           "(:applicationId IS NULL OR d.application.id = :applicationId) AND " +
           "(:dependencyTypeId IS NULL OR d.dependencyType.id = :dependencyTypeId) AND " +
           "(:status IS NULL OR " +
           "  (:status = 'ACTIVE' AND (d.validityEndDate IS NULL OR d.validityEndDate >= :now) AND (d.validityStartDate IS NULL OR d.validityStartDate <= :now)) OR " +
           "  (:status = 'EXPIRING' AND d.validityEndDate IS NOT NULL AND d.validityEndDate >= :now AND d.validityEndDate <= :expiringDate) OR " +
           "  (:status = 'EXPIRED' AND d.validityEndDate IS NOT NULL AND d.validityEndDate < :now) OR " +
           "  (:status = 'NOT_YET_VALID' AND d.validityStartDate IS NOT NULL AND d.validityStartDate > :now)" +
           ")")
    Page<ExternalDependency> search(
        @Param("applicationId") UUID applicationId,
        @Param("dependencyTypeId") UUID dependencyTypeId,
        @Param("status") String status,
        @Param("now") LocalDate now,
        @Param("expiringDate") LocalDate expiringDate,
        Pageable pageable
    );
    
    long countByDependencyTypeId(UUID dependencyTypeId);
}
