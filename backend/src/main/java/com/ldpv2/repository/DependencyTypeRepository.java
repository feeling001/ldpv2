package com.ldpv2.repository;

import com.ldpv2.domain.entity.DependencyType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface DependencyTypeRepository extends JpaRepository<DependencyType, UUID> {
    Optional<DependencyType> findByTypeName(String typeName);
    boolean existsByTypeName(String typeName);
}
