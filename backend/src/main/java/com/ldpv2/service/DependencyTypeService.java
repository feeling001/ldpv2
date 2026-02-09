package com.ldpv2.service;

import com.ldpv2.domain.entity.DependencyType;
import com.ldpv2.dto.request.CreateDependencyTypeRequest;
import com.ldpv2.dto.request.UpdateDependencyTypeRequest;
import com.ldpv2.dto.response.DependencyTypeResponse;
import com.ldpv2.exception.BadRequestException;
import com.ldpv2.exception.ResourceNotFoundException;
import com.ldpv2.repository.DependencyTypeRepository;
import com.ldpv2.repository.ExternalDependencyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DependencyTypeService {

    @Autowired
    private DependencyTypeRepository dependencyTypeRepository;
    
    @Autowired
    private ExternalDependencyRepository externalDependencyRepository;

    @Transactional
    public DependencyTypeResponse create(CreateDependencyTypeRequest request) {
        if (dependencyTypeRepository.existsByTypeName(request.getTypeName())) {
            throw new BadRequestException("Dependency type '" + request.getTypeName() + "' already exists");
        }

        DependencyType type = new DependencyType();
        type.setTypeName(request.getTypeName());
        type.setDescription(request.getDescription());
        type.setIsCustom(true); // User-created types are custom

        type = dependencyTypeRepository.save(type);
        return mapToResponse(type);
    }

    @Transactional
    public DependencyTypeResponse update(UUID id, UpdateDependencyTypeRequest request) {
        DependencyType type = dependencyTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dependency type not found with id: " + id));

        if (request.getTypeName() != null && !request.getTypeName().equals(type.getTypeName())) {
            if (dependencyTypeRepository.existsByTypeName(request.getTypeName())) {
                throw new BadRequestException("Dependency type '" + request.getTypeName() + "' already exists");
            }
            type.setTypeName(request.getTypeName());
        }

        if (request.getDescription() != null) {
            type.setDescription(request.getDescription());
        }

        type = dependencyTypeRepository.save(type);
        return mapToResponse(type);
    }

    public DependencyTypeResponse findById(UUID id) {
        DependencyType type = dependencyTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dependency type not found with id: " + id));
        return mapToResponse(type);
    }

    public List<DependencyTypeResponse> findAll() {
        return dependencyTypeRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void delete(UUID id) {
        DependencyType type = dependencyTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dependency type not found with id: " + id));

        // Check if type is being used
        long count = externalDependencyRepository.countByDependencyTypeId(id);
        if (count > 0) {
            throw new BadRequestException("Cannot delete dependency type with " + count + " existing dependencies");
        }

        dependencyTypeRepository.delete(type);
    }

    private DependencyTypeResponse mapToResponse(DependencyType type) {
        return new DependencyTypeResponse(
            type.getId(),
            type.getTypeName(),
            type.getDescription(),
            type.getIsCustom(),
            type.getCreatedAt(),
            type.getUpdatedAt()
        );
    }
}
