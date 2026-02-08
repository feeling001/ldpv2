package com.ldpv2.repository;

import com.ldpv2.domain.entity.BusinessUnit;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface BusinessUnitRepository extends JpaRepository<BusinessUnit, UUID> {
    Optional<BusinessUnit> findByName(String name);
    boolean existsByName(String name);
    Page<BusinessUnit> findByNameContainingIgnoreCase(String name, Pageable pageable);
}
