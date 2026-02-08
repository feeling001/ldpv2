package com.ldpv2.repository;

import com.ldpv2.domain.entity.ContactRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ContactRoleRepository extends JpaRepository<ContactRole, UUID> {
    Optional<ContactRole> findByRoleName(String roleName);
    boolean existsByRoleName(String roleName);
}
