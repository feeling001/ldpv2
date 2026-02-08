package com.ldpv2.service;

import com.ldpv2.domain.entity.ContactRole;
import com.ldpv2.dto.request.CreateContactRoleRequest;
import com.ldpv2.dto.response.ContactRoleResponse;
import com.ldpv2.exception.BadRequestException;
import com.ldpv2.repository.ContactRoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ContactRoleService {

    @Autowired
    private ContactRoleRepository contactRoleRepository;

    @Transactional
    public ContactRoleResponse create(CreateContactRoleRequest request) {
        if (contactRoleRepository.existsByRoleName(request.getRoleName())) {
            throw new BadRequestException("Contact role with name '" + request.getRoleName() + "' already exists");
        }

        ContactRole role = new ContactRole();
        role.setRoleName(request.getRoleName());
        role.setDescription(request.getDescription());

        role = contactRoleRepository.save(role);
        return mapToResponse(role);
    }

    public List<ContactRoleResponse> findAll() {
        return contactRoleRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private ContactRoleResponse mapToResponse(ContactRole role) {
        return new ContactRoleResponse(
            role.getId(),
            role.getRoleName(),
            role.getDescription(),
            role.getCreatedAt(),
            role.getUpdatedAt()
        );
    }
}
