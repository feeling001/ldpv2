package com.ldpv2.service;

import com.ldpv2.domain.entity.Application;
import com.ldpv2.domain.entity.Version;
import com.ldpv2.dto.request.CreateVersionRequest;
import com.ldpv2.dto.request.UpdateVersionRequest;
import com.ldpv2.dto.response.VersionResponse;
import com.ldpv2.exception.BadRequestException;
import com.ldpv2.exception.ResourceNotFoundException;
import com.ldpv2.repository.ApplicationRepository;
import com.ldpv2.repository.VersionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Service
public class VersionService {

    @Autowired
    private VersionRepository versionRepository;
    
    @Autowired
    private ApplicationRepository applicationRepository;

    @Transactional
    public VersionResponse create(UUID applicationId, CreateVersionRequest request) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Application not found with id: " + applicationId));
        
        // Check if version identifier already exists for this application
        if (versionRepository.existsByApplicationIdAndVersionIdentifier(
                applicationId, request.getVersionIdentifier())) {
            throw new BadRequestException(
                    "Version '" + request.getVersionIdentifier() + 
                    "' already exists for this application");
        }
        
        // Validate dates
        if (request.getEndOfLifeDate() != null && 
            request.getReleaseDate().isAfter(request.getEndOfLifeDate())) {
            throw new BadRequestException(
                    "End of life date must be after release date");
        }
        
        // Validate release date is not in future
        if (request.getReleaseDate().isAfter(LocalDate.now())) {
            throw new BadRequestException("Release date cannot be in the future");
        }

        Version version = new Version();
        version.setApplication(application);
        version.setVersionIdentifier(request.getVersionIdentifier());
        version.setExternalReference(request.getExternalReference());
        version.setReleaseDate(request.getReleaseDate());
        version.setEndOfLifeDate(request.getEndOfLifeDate());

        version = versionRepository.save(version);
        return mapToResponse(version);
    }

    @Transactional
    public VersionResponse update(UUID id, UpdateVersionRequest request) {
        Version version = versionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Version not found with id: " + id));

        if (request.getVersionIdentifier() != null) {
            // Check if new version identifier already exists for this application
            if (!request.getVersionIdentifier().equals(version.getVersionIdentifier()) &&
                versionRepository.existsByApplicationIdAndVersionIdentifier(
                        version.getApplication().getId(), request.getVersionIdentifier())) {
                throw new BadRequestException(
                        "Version '" + request.getVersionIdentifier() + 
                        "' already exists for this application");
            }
            version.setVersionIdentifier(request.getVersionIdentifier());
        }
        
        if (request.getExternalReference() != null) {
            version.setExternalReference(request.getExternalReference());
        }
        
        if (request.getReleaseDate() != null) {
            if (request.getReleaseDate().isAfter(LocalDate.now())) {
                throw new BadRequestException("Release date cannot be in the future");
            }
            version.setReleaseDate(request.getReleaseDate());
        }
        
        if (request.getEndOfLifeDate() != null) {
            version.setEndOfLifeDate(request.getEndOfLifeDate());
        }
        
        // Validate dates
        if (version.getEndOfLifeDate() != null && 
            version.getReleaseDate().isAfter(version.getEndOfLifeDate())) {
            throw new BadRequestException(
                    "End of life date must be after release date");
        }

        version = versionRepository.save(version);
        return mapToResponse(version);
    }

    public VersionResponse findById(UUID id) {
        Version version = versionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Version not found with id: " + id));
        return mapToResponse(version);
    }

    public Page<VersionResponse> findByApplication(UUID applicationId, Pageable pageable) {
        if (!applicationRepository.existsById(applicationId)) {
            throw new ResourceNotFoundException(
                    "Application not found with id: " + applicationId);
        }
        return versionRepository.findByApplicationId(applicationId, pageable)
                .map(this::mapToResponse);
    }
    
    public Optional<VersionResponse> findLatestByApplication(UUID applicationId) {
        if (!applicationRepository.existsById(applicationId)) {
            throw new ResourceNotFoundException(
                    "Application not found with id: " + applicationId);
        }
        return versionRepository.findLatestByApplicationId(applicationId)
                .map(this::mapToResponse);
    }

    @Transactional
    public void delete(UUID id) {
        Version version = versionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Version not found with id: " + id));
        
        // Note: In production, check if version is deployed anywhere before deletion
        versionRepository.delete(version);
    }

    private VersionResponse mapToResponse(Version version) {
        return new VersionResponse(
            version.getId(),
            version.getApplication().getId(),
            version.getApplication().getName(),
            version.getVersionIdentifier(),
            version.getExternalReference(),
            version.getReleaseDate(),
            version.getEndOfLifeDate(),
            version.getCreatedAt(),
            version.getUpdatedAt()
        );
    }
}
