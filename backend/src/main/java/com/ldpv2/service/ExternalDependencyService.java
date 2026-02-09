package com.ldpv2.service;

import com.ldpv2.domain.entity.Application;
import com.ldpv2.domain.entity.DependencyType;
import com.ldpv2.domain.entity.ExternalDependency;
import com.ldpv2.dto.request.CreateExternalDependencyRequest;
import com.ldpv2.dto.request.UpdateExternalDependencyRequest;
import com.ldpv2.dto.response.ApplicationSummaryResponse;
import com.ldpv2.dto.response.DependencyTypeResponse;
import com.ldpv2.dto.response.ExternalDependencyResponse;
import com.ldpv2.exception.BadRequestException;
import com.ldpv2.exception.ResourceNotFoundException;
import com.ldpv2.repository.ApplicationRepository;
import com.ldpv2.repository.DependencyTypeRepository;
import com.ldpv2.repository.ExternalDependencyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ExternalDependencyService {

    @Autowired
    private ExternalDependencyRepository externalDependencyRepository;
    
    @Autowired
    private ApplicationRepository applicationRepository;
    
    @Autowired
    private DependencyTypeRepository dependencyTypeRepository;

    @Transactional
    public ExternalDependencyResponse create(UUID applicationId, CreateExternalDependencyRequest request) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + applicationId));

        DependencyType dependencyType = dependencyTypeRepository.findById(request.getDependencyTypeId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Dependency type not found with id: " + request.getDependencyTypeId()));

        // Validate dates
        if (request.getValidityStartDate() != null && request.getValidityEndDate() != null) {
            if (request.getValidityEndDate().isBefore(request.getValidityStartDate())) {
                throw new BadRequestException("End date must be after or equal to start date");
            }
        }

        ExternalDependency dependency = new ExternalDependency();
        dependency.setApplication(application);
        dependency.setDependencyType(dependencyType);
        dependency.setName(request.getName());
        dependency.setDescription(request.getDescription());
        dependency.setTechnicalDocumentation(request.getTechnicalDocumentation());
        dependency.setValidityStartDate(request.getValidityStartDate());
        dependency.setValidityEndDate(request.getValidityEndDate());

        dependency = externalDependencyRepository.save(dependency);
        return mapToResponse(dependency);
    }

    @Transactional
    public ExternalDependencyResponse update(UUID id, UpdateExternalDependencyRequest request) {
        ExternalDependency dependency = externalDependencyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("External dependency not found with id: " + id));

        if (request.getDependencyTypeId() != null) {
            DependencyType dependencyType = dependencyTypeRepository.findById(request.getDependencyTypeId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Dependency type not found with id: " + request.getDependencyTypeId()));
            dependency.setDependencyType(dependencyType);
        }

        if (request.getName() != null) {
            dependency.setName(request.getName());
        }

        if (request.getDescription() != null) {
            dependency.setDescription(request.getDescription());
        }

        if (request.getTechnicalDocumentation() != null) {
            dependency.setTechnicalDocumentation(request.getTechnicalDocumentation());
        }

        if (request.getValidityStartDate() != null) {
            dependency.setValidityStartDate(request.getValidityStartDate());
        }

        if (request.getValidityEndDate() != null) {
            dependency.setValidityEndDate(request.getValidityEndDate());
        }

        // Validate dates after updates
        if (dependency.getValidityStartDate() != null && dependency.getValidityEndDate() != null) {
            if (dependency.getValidityEndDate().isBefore(dependency.getValidityStartDate())) {
                throw new BadRequestException("End date must be after or equal to start date");
            }
        }

        dependency = externalDependencyRepository.save(dependency);
        return mapToResponse(dependency);
    }

    public ExternalDependencyResponse findById(UUID id) {
        ExternalDependency dependency = externalDependencyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("External dependency not found with id: " + id));
        return mapToResponse(dependency);
    }

    public Page<ExternalDependencyResponse> findByApplication(UUID applicationId, Pageable pageable) {
        if (!applicationRepository.existsById(applicationId)) {
            throw new ResourceNotFoundException("Application not found with id: " + applicationId);
        }
        return externalDependencyRepository.findByApplicationId(applicationId, pageable)
                .map(this::mapToResponse);
    }

    public Page<ExternalDependencyResponse> findAll(Pageable pageable) {
        return externalDependencyRepository.findAll(pageable).map(this::mapToResponse);
    }

    public Page<ExternalDependencyResponse> search(
            UUID applicationId,
            UUID dependencyTypeId,
            String status,
            Pageable pageable) {
        
        LocalDate now = LocalDate.now();
        LocalDate expiringDate = now.plusDays(30);
        
        return externalDependencyRepository.search(
                applicationId, dependencyTypeId, status, now, expiringDate, pageable)
                .map(this::mapToResponse);
    }

    public List<ExternalDependencyResponse> findExpiring(int days) {
        LocalDate now = LocalDate.now();
        LocalDate expirationDate = now.plusDays(days);
        return externalDependencyRepository.findExpiring(now, expirationDate).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ExternalDependencyResponse> findExpired() {
        LocalDate now = LocalDate.now();
        return externalDependencyRepository.findExpired(now).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void delete(UUID id) {
        if (!externalDependencyRepository.existsById(id)) {
            throw new ResourceNotFoundException("External dependency not found with id: " + id);
        }
        externalDependencyRepository.deleteById(id);
    }

    private ExternalDependencyResponse mapToResponse(ExternalDependency dependency) {
        ApplicationSummaryResponse appSummary = new ApplicationSummaryResponse(
            dependency.getApplication().getId(),
            dependency.getApplication().getName(),
            dependency.getApplication().getStatus(),
            dependency.getApplication().getBusinessUnit().getName()
        );

        DependencyTypeResponse typeResponse = new DependencyTypeResponse(
            dependency.getDependencyType().getId(),
            dependency.getDependencyType().getTypeName(),
            dependency.getDependencyType().getDescription(),
            dependency.getDependencyType().getIsCustom(),
            dependency.getDependencyType().getCreatedAt(),
            dependency.getDependencyType().getUpdatedAt()
        );

        // Compute status
        String status = computeStatus(dependency);
        Boolean isActive = "ACTIVE".equals(status) || "EXPIRING".equals(status);
        Integer daysUntilExpiration = computeDaysUntilExpiration(dependency);

        return new ExternalDependencyResponse(
            dependency.getId(),
            appSummary,
            typeResponse,
            dependency.getName(),
            dependency.getDescription(),
            dependency.getTechnicalDocumentation(),
            dependency.getValidityStartDate(),
            dependency.getValidityEndDate(),
            isActive,
            daysUntilExpiration,
            status,
            dependency.getCreatedAt(),
            dependency.getUpdatedAt()
        );
    }

    private String computeStatus(ExternalDependency dependency) {
        LocalDate now = LocalDate.now();

        if (dependency.getValidityStartDate() != null && now.isBefore(dependency.getValidityStartDate())) {
            return "NOT_YET_VALID";
        }

        if (dependency.getValidityEndDate() == null) {
            return "ACTIVE"; // No end date = indefinite
        }

        if (now.isAfter(dependency.getValidityEndDate())) {
            return "EXPIRED";
        }

        long daysUntilExpiration = ChronoUnit.DAYS.between(now, dependency.getValidityEndDate());
        if (daysUntilExpiration <= 30) {
            return "EXPIRING";
        }

        return "ACTIVE";
    }

    private Integer computeDaysUntilExpiration(ExternalDependency dependency) {
        if (dependency.getValidityEndDate() == null) {
            return null;
        }

        LocalDate now = LocalDate.now();
        if (now.isAfter(dependency.getValidityEndDate())) {
            return null; // Already expired
        }

        return (int) ChronoUnit.DAYS.between(now, dependency.getValidityEndDate());
    }
}
