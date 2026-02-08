package com.ldpv2.repository;

import com.ldpv2.domain.entity.Version;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface VersionRepository extends JpaRepository<Version, UUID> {
    
    Page<Version> findByApplicationId(UUID applicationId, Pageable pageable);
    
    Optional<Version> findByApplicationIdAndVersionIdentifier(UUID applicationId, String versionIdentifier);
    
    boolean existsByApplicationIdAndVersionIdentifier(UUID applicationId, String versionIdentifier);
    
    @Query("SELECT v FROM Version v WHERE v.application.id = :applicationId ORDER BY v.releaseDate DESC LIMIT 1")
    Optional<Version> findLatestByApplicationId(@Param("applicationId") UUID applicationId);
}
