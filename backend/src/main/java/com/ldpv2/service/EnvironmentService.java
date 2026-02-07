package com.ldpv2.service;

import com.ldpv2.domain.entity.Environment;
import com.ldpv2.dto.request.CreateEnvironmentRequest;
import com.ldpv2.dto.request.UpdateEnvironmentRequest;
import com.ldpv2.dto.response.EnvironmentResponse;
import com.ldpv2.exception.BadRequestException;
import com.ldpv2.exception.ResourceNotFoundException;
import com.ldpv2.repository.EnvironmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class EnvironmentService {

    @Autowired
    private EnvironmentRepository environmentRepository;

    @Transactional
    public EnvironmentResponse create(CreateEnvironmentRequest request) {
        // Check if name already exists
        if (environmentRepository.existsByName(request.getName())) {
            throw new BadRequestException("Environment with name '" + request.getName() + "' already exists");
        }

        Environment environment = new Environment();
        environment.setName(request.getName());
        environment.setDescription(request.getDescription());
        environment.setIsProduction(request.getIsProduction() != null ? request.getIsProduction() : false);
        environment.setCriticalityLevel(request.getCriticalityLevel());

        environment = environmentRepository.save(environment);
        return mapToResponse(environment);
    }

    @Transactional
    public EnvironmentResponse update(UUID id, UpdateEnvironmentRequest request) {
        Environment environment = environmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Environment not found with id: " + id));

        // Check if new name already exists (excluding current environment)
        if (request.getName() != null && !request.getName().equals(environment.getName())) {
            if (environmentRepository.existsByName(request.getName())) {
                throw new BadRequestException("Environment with name '" + request.getName() + "' already exists");
            }
            environment.setName(request.getName());
        }

        if (request.getDescription() != null) {
            environment.setDescription(request.getDescription());
        }

        if (request.getIsProduction() != null) {
            environment.setIsProduction(request.getIsProduction());
        }

        if (request.getCriticalityLevel() != null) {
            environment.setCriticalityLevel(request.getCriticalityLevel());
        }

        environment = environmentRepository.save(environment);
        return mapToResponse(environment);
    }

    public EnvironmentResponse findById(UUID id) {
        Environment environment = environmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Environment not found with id: " + id));
        return mapToResponse(environment);
    }

    public Page<EnvironmentResponse> findAll(Pageable pageable) {
        return environmentRepository.findAll(pageable).map(this::mapToResponse);
    }

    public Page<EnvironmentResponse> search(String query, Pageable pageable) {
        return environmentRepository.findByNameContainingIgnoreCase(query, pageable)
                .map(this::mapToResponse);
    }

    @Transactional
    public void delete(UUID id) {
        if (!environmentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Environment not found with id: " + id);
        }
        environmentRepository.deleteById(id);
    }

    private EnvironmentResponse mapToResponse(Environment environment) {
        return new EnvironmentResponse(
            environment.getId(),
            environment.getName(),
            environment.getDescription(),
            environment.getIsProduction(),
            environment.getCriticalityLevel(),
            environment.getCreatedAt(),
            environment.getUpdatedAt()
        );
    }
}
