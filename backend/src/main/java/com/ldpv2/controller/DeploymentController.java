package com.ldpv2.controller;

import com.ldpv2.dto.request.RecordDeploymentRequest;
import com.ldpv2.dto.response.CurrentDeploymentStateResponse;
import com.ldpv2.dto.response.DeploymentResponse;
import com.ldpv2.service.DeploymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/deployments")
@Tag(name = "Deployments", description = "Deployment tracking endpoints")
@SecurityRequirement(name = "bearerAuth")
public class DeploymentController {

    @Autowired
    private DeploymentService deploymentService;

    @PostMapping
    @Operation(summary = "Record deployment", description = "Record a new deployment")
    public ResponseEntity<DeploymentResponse> recordDeployment(
            @Valid @RequestBody RecordDeploymentRequest request) {
        DeploymentResponse response = deploymentService.recordDeployment(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get deployment", description = "Get deployment by ID")
    public ResponseEntity<DeploymentResponse> getById(@PathVariable UUID id) {
        DeploymentResponse response = deploymentService.findById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @Operation(summary = "List deployments", description = "Get paginated list of deployments with optional filters")
    public ResponseEntity<Page<DeploymentResponse>> getAll(
            @RequestParam(required = false) UUID applicationId,
            @RequestParam(required = false) UUID environmentId,
            @RequestParam(required = false) UUID versionId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateTo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "deploymentDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {
        
        Sort sort = sortDirection.equalsIgnoreCase("desc") 
            ? Sort.by(sortBy).descending() 
            : Sort.by(sortBy).ascending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<DeploymentResponse> response;
        if (applicationId != null || environmentId != null || versionId != null || dateFrom != null || dateTo != null) {
            response = deploymentService.search(applicationId, environmentId, versionId, dateFrom, dateTo, pageable);
        } else {
            response = deploymentService.findAll(pageable);
        }
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/current")
    @Operation(summary = "Get current state", description = "Get current deployment state across environments")
    public ResponseEntity<List<CurrentDeploymentStateResponse>> getCurrentState(
            @RequestParam(required = false) UUID applicationId,
            @RequestParam(required = false) UUID environmentId) {
        List<CurrentDeploymentStateResponse> response = deploymentService.getCurrentState(applicationId, environmentId);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/by-application/{applicationId}")
    @Operation(summary = "Get deployments by application", description = "Get deployment history for an application")
    public ResponseEntity<Page<DeploymentResponse>> getByApplication(
            @PathVariable UUID applicationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("deploymentDate").descending());
        Page<DeploymentResponse> response = deploymentService.findByApplication(applicationId, pageable);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/by-environment/{environmentId}")
    @Operation(summary = "Get deployments by environment", description = "Get all deployments to an environment")
    public ResponseEntity<Page<DeploymentResponse>> getByEnvironment(
            @PathVariable UUID environmentId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("deploymentDate").descending());
        Page<DeploymentResponse> response = deploymentService.findByEnvironment(environmentId, pageable);
        return ResponseEntity.ok(response);
    }
}
