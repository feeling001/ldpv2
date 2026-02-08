package com.ldpv2.repository;

import com.ldpv2.domain.entity.Deployment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DeploymentRepository extends JpaRepository<Deployment, UUID> {
    
    Page<Deployment> findByApplicationId(UUID applicationId, Pageable pageable);
    
    Page<Deployment> findByEnvironmentId(UUID environmentId, Pageable pageable);
    
    Page<Deployment> findByApplicationIdAndEnvironmentId(UUID applicationId, UUID environmentId, Pageable pageable);
    
    @Query("SELECT d FROM Deployment d WHERE " +
           "(:applicationId IS NULL OR d.application.id = :applicationId) AND " +
           "(:environmentId IS NULL OR d.environment.id = :environmentId) AND " +
           "(:versionId IS NULL OR d.version.id = :versionId) AND " +
           "(:dateFrom IS NULL OR d.deploymentDate >= :dateFrom) AND " +
           "(:dateTo IS NULL OR d.deploymentDate <= :dateTo)")
    Page<Deployment> search(
        @Param("applicationId") UUID applicationId,
        @Param("environmentId") UUID environmentId,
        @Param("versionId") UUID versionId,
        @Param("dateFrom") LocalDateTime dateFrom,
        @Param("dateTo") LocalDateTime dateTo,
        Pageable pageable
    );
    
    /**
     * Get current deployment state - most recent deployment per application/environment
     */
    @Query("SELECT d FROM Deployment d WHERE d.id IN (" +
           "  SELECT MAX(d2.id) FROM Deployment d2 " +
           "  WHERE (:applicationId IS NULL OR d2.application.id = :applicationId) AND " +
           "        (:environmentId IS NULL OR d2.environment.id = :environmentId) " +
           "  GROUP BY d2.application.id, d2.environment.id" +
           ")")
    List<Deployment> findCurrentState(
        @Param("applicationId") UUID applicationId,
        @Param("environmentId") UUID environmentId
    );
    
    /**
     * Get current deployment for specific application in specific environment
     */
    @Query("SELECT d FROM Deployment d " +
           "WHERE d.application.id = :applicationId AND d.environment.id = :environmentId " +
           "ORDER BY d.deploymentDate DESC LIMIT 1")
    Optional<Deployment> findCurrentForApplicationInEnvironment(
        @Param("applicationId") UUID applicationId,
        @Param("environmentId") UUID environmentId
    );
}
