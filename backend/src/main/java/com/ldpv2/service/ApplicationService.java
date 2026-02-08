package com.ldpv2.service;

import com.ldpv2.domain.entity.Application;
import com.ldpv2.domain.entity.BusinessUnit;
import com.ldpv2.domain.enums.ApplicationStatus;
import com.ldpv2.dto.request.CreateApplicationRequest;
import com.ldpv2.dto.request.UpdateApplicationRequest;
import com.ldpv2.dto.response.ApplicationResponse;
import com.ldpv2.dto.response.BusinessUnitSummaryResponse;
import com.ldpv2.exception.BadRequestException;
import com.ldpv2.exception.ResourceNotFoundException;
import com.ldpv2.repository.ApplicationRepository;
import com.ldpv2.repository.BusinessUnitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class ApplicationService {

    @Autowired
    private ApplicationRepository applicationRepository;
    
    @Autowired
    private BusinessUnitRepository businessUnitRepository;

    @Transactional
    public ApplicationResponse create(CreateApplicationRequest request) {
        // Validate business unit exists
        BusinessUnit businessUnit = businessUnitRepository.findById(request.getBusinessUnitId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Business unit not found with id: " + request.getBusinessUnitId()));
        
        // Validate dates if both are provided
        if (request.getEndOfSupportDate() != null && request.getEndOfLifeDate() != null) {
            if (request.getEndOfSupportDate().isAfter(request.getEndOfLifeDate())) {
                throw new BadRequestException(
                        "End of support date must be before end of life date");
            }
        }

        Application application = new Application();
        application.setName(request.getName());
        application.setDescription(request.getDescription());
        application.setStatus(request.getStatus());
        application.setBusinessUnit(businessUnit);
        application.setEndOfLifeDate(request.getEndOfLifeDate());
        application.setEndOfSupportDate(request.getEndOfSupportDate());

        application = applicationRepository.save(application);
        return mapToResponse(application);
    }

    @Transactional
    public ApplicationResponse update(UUID id, UpdateApplicationRequest request) {
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Application not found with id: " + id));

        if (request.getName() != null) {
            application.setName(request.getName());
        }
        
        if (request.getDescription() != null) {
            application.setDescription(request.getDescription());
        }
        
        if (request.getStatus() != null) {
            application.setStatus(request.getStatus());
        }
        
        if (request.getBusinessUnitId() != null) {
            BusinessUnit businessUnit = businessUnitRepository.findById(request.getBusinessUnitId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Business unit not found with id: " + request.getBusinessUnitId()));
            application.setBusinessUnit(businessUnit);
        }
        
        if (request.getEndOfLifeDate() != null) {
            application.setEndOfLifeDate(request.getEndOfLifeDate());
        }
        
        if (request.getEndOfSupportDate() != null) {
            application.setEndOfSupportDate(request.getEndOfSupportDate());
        }
        
        // Validate dates if both are set
        if (application.getEndOfSupportDate() != null && application.getEndOfLifeDate() != null) {
            if (application.getEndOfSupportDate().isAfter(application.getEndOfLifeDate())) {
                throw new BadRequestException(
                        "End of support date must be before end of life date");
            }
        }

        application = applicationRepository.save(application);
        return mapToResponse(application);
    }
    
    @Transactional
    public ApplicationResponse updateStatus(UUID id, ApplicationStatus newStatus) {
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Application not found with id: " + id));
        
        application.setStatus(newStatus);
        application = applicationRepository.save(application);
        return mapToResponse(application);
    }

    public ApplicationResponse findById(UUID id) {
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Application not found with id: " + id));
        return mapToResponse(application);
    }

    public Page<ApplicationResponse> findAll(Pageable pageable) {
        return applicationRepository.findAll(pageable).map(this::mapToResponse);
    }
    
    public Page<ApplicationResponse> findByStatus(ApplicationStatus status, Pageable pageable) {
        return applicationRepository.findByStatus(status, pageable).map(this::mapToResponse);
    }
    
    public Page<ApplicationResponse> findByBusinessUnit(UUID businessUnitId, Pageable pageable) {
        return applicationRepository.findByBusinessUnitId(businessUnitId, pageable)
                .map(this::mapToResponse);
    }

    public Page<ApplicationResponse> search(ApplicationStatus status, UUID businessUnitId, 
                                           String name, Pageable pageable) {
        return applicationRepository.search(status, businessUnitId, name, pageable)
                .map(this::mapToResponse);
    }

    @Transactional
    public void delete(UUID id) {
        if (!applicationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Application not found with id: " + id);
        }
        applicationRepository.deleteById(id);
    }

    private ApplicationResponse mapToResponse(Application application) {
        BusinessUnitSummaryResponse buSummary = new BusinessUnitSummaryResponse(
            application.getBusinessUnit().getId(),
            application.getBusinessUnit().getName()
        );
        
        return new ApplicationResponse(
            application.getId(),
            application.getName(),
            application.getDescription(),
            application.getStatus(),
            buSummary,
            application.getEndOfLifeDate(),
            application.getEndOfSupportDate(),
            application.getCreatedAt(),
            application.getUpdatedAt()
        );
    }
}
