package com.ldpv2.service;

import com.ldpv2.domain.entity.Application;
import com.ldpv2.domain.entity.Deployment;
import com.ldpv2.domain.entity.Environment;
import com.ldpv2.domain.entity.Version;
import com.ldpv2.dto.request.RecordDeploymentRequest;
import com.ldpv2.dto.response.*;
import com.ldpv2.exception.BadRequestException;
import com.ldpv2.exception.ResourceNotFoundException;
import com.ldpv2.repository.ApplicationRepository;
import com.ldpv2.repository.DeploymentRepository;
import com.ldpv2.repository.EnvironmentRepository;
import com.ldpv2.repository.VersionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DeploymentService {

    @Autowired
    private DeploymentRepository deploymentRepository;
    
    @Autowired
    private ApplicationRepository applicationRepository;
    
    @Autowired
    private VersionRepository versionRepository;
    
    @Autowired
    private EnvironmentRepository environmentRepository;

    @Transactional
    public DeploymentResponse recordDeployment(RecordDeploymentRequest request) {
        // Validate application exists
        Application application = applicationRepository.findById(request.getApplicationId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Application not found with id: " + request.getApplicationId()));
        
        // Validate version exists
        Version version = versionRepository.findById(request.getVersionId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Version not found with id: " + request.getVersionId()));
        
        // Validate environment exists
        Environment environment = environmentRepository.findById(request.getEnvironmentId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Environment not found with id: " + request.getEnvironmentId()));
        
        // Validate that version belongs to the application
        if (!version.getApplication().getId().equals(request.getApplicationId())) {
            throw new BadRequestException(
                    "Version does not belong to the specified application");
        }
        
        // Validate deployment date is not in future
        if (request.getDeploymentDate().isAfter(LocalDateTime.now())) {
            throw new BadRequestException("Deployment date cannot be in the future");
        }

        Deployment deployment = new Deployment();
        deployment.setApplication(application);
        deployment.setVersion(version);
        deployment.setEnvironment(environment);
        deployment.setDeploymentDate(request.getDeploymentDate());
        deployment.setDeployedBy(request.getDeployedBy());
        deployment.setNotes(request.getNotes());

        deployment = deploymentRepository.save(deployment);
        return mapToResponse(deployment);
    }

    public DeploymentResponse findById(UUID id) {
        Deployment deployment = deploymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Deployment not found with id: " + id));
        return mapToResponse(deployment);
    }

    public Page<DeploymentResponse> findAll(Pageable pageable) {
        return deploymentRepository.findAll(pageable).map(this::mapToResponse);
    }
    
    public Page<DeploymentResponse> findByApplication(UUID applicationId, Pageable pageable) {
        if (!applicationRepository.existsById(applicationId)) {
            throw new ResourceNotFoundException(
                    "Application not found with id: " + applicationId);
        }
        return deploymentRepository.findByApplicationId(applicationId, pageable)
                .map(this::mapToResponse);
    }
    
    public Page<DeploymentResponse> findByEnvironment(UUID environmentId, Pageable pageable) {
        if (!environmentRepository.existsById(environmentId)) {
            throw new ResourceNotFoundException(
                    "Environment not found with id: " + environmentId);
        }
        return deploymentRepository.findByEnvironmentId(environmentId, pageable)
                .map(this::mapToResponse);
    }
    
    public Page<DeploymentResponse> search(
            UUID applicationId, 
            UUID environmentId, 
            UUID versionId,
            LocalDateTime dateFrom,
            LocalDateTime dateTo,
            Pageable pageable) {
        return deploymentRepository.search(
                applicationId, environmentId, versionId, dateFrom, dateTo, pageable)
                .map(this::mapToResponse);
    }
    
    public List<CurrentDeploymentStateResponse> getCurrentState(UUID applicationId, UUID environmentId) {
        List<Deployment> deployments = deploymentRepository.findCurrentState(applicationId, environmentId);
        return deployments.stream()
                .map(this::mapToCurrentStateResponse)
                .collect(Collectors.toList());
    }

    private DeploymentResponse mapToResponse(Deployment deployment) {
        ApplicationSummaryResponse appSummary = new ApplicationSummaryResponse(
            deployment.getApplication().getId(),
            deployment.getApplication().getName(),
            deployment.getApplication().getStatus(),
            deployment.getApplication().getBusinessUnit().getName()
        );
        
        VersionSummaryResponse versionSummary = new VersionSummaryResponse(
            deployment.getVersion().getId(),
            deployment.getVersion().getVersionIdentifier(),
            deployment.getVersion().getReleaseDate()
        );
        
        EnvironmentSummaryResponse envSummary = new EnvironmentSummaryResponse(
            deployment.getEnvironment().getId(),
            deployment.getEnvironment().getName(),
            deployment.getEnvironment().getIsProduction()
        );
        
        return new DeploymentResponse(
            deployment.getId(),
            appSummary,
            versionSummary,
            envSummary,
            deployment.getDeploymentDate(),
            deployment.getDeployedBy(),
            deployment.getNotes(),
            deployment.getCreatedAt()
        );
    }
    
    private CurrentDeploymentStateResponse mapToCurrentStateResponse(Deployment deployment) {
        ApplicationSummaryResponse appSummary = new ApplicationSummaryResponse(
            deployment.getApplication().getId(),
            deployment.getApplication().getName(),
            deployment.getApplication().getStatus(),
            deployment.getApplication().getBusinessUnit().getName()
        );
        
        VersionSummaryResponse versionSummary = new VersionSummaryResponse(
            deployment.getVersion().getId(),
            deployment.getVersion().getVersionIdentifier(),
            deployment.getVersion().getReleaseDate()
        );
        
        EnvironmentSummaryResponse envSummary = new EnvironmentSummaryResponse(
            deployment.getEnvironment().getId(),
            deployment.getEnvironment().getName(),
            deployment.getEnvironment().getIsProduction()
        );
        
        return new CurrentDeploymentStateResponse(
            appSummary,
            envSummary,
            versionSummary,
            deployment.getDeploymentDate(),
            deployment.getDeployedBy()
        );
    }
}
