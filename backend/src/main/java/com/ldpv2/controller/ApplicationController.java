package com.ldpv2.controller;

import com.ldpv2.domain.enums.ApplicationStatus;
import com.ldpv2.dto.request.CreateApplicationRequest;
import com.ldpv2.dto.request.UpdateApplicationRequest;
import com.ldpv2.dto.response.ApplicationResponse;
import com.ldpv2.service.ApplicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/applications")
@Tag(name = "Applications", description = "Application management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class ApplicationController {

    @Autowired
    private ApplicationService applicationService;

    @PostMapping
    @Operation(summary = "Create application", description = "Create a new application")
    public ResponseEntity<ApplicationResponse> create(@Valid @RequestBody CreateApplicationRequest request) {
        ApplicationResponse response = applicationService.create(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update application", description = "Update an existing application")
    public ResponseEntity<ApplicationResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateApplicationRequest request) {
        ApplicationResponse response = applicationService.update(id, request);
        return ResponseEntity.ok(response);
    }
    
    @PatchMapping("/{id}/status")
    @Operation(summary = "Update status", description = "Update application status only")
    public ResponseEntity<ApplicationResponse> updateStatus(
            @PathVariable UUID id,
            @RequestParam ApplicationStatus status) {
        ApplicationResponse response = applicationService.updateStatus(id, status);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get application", description = "Get application by ID")
    public ResponseEntity<ApplicationResponse> getById(@PathVariable UUID id) {
        ApplicationResponse response = applicationService.findById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @Operation(summary = "List applications", description = "Get paginated list of applications")
    public ResponseEntity<Page<ApplicationResponse>> getAll(
            @RequestParam(required = false) ApplicationStatus status,
            @RequestParam(required = false) UUID businessUnitId,
            @RequestParam(required = false) String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection) {
        
        Sort sort = sortDirection.equalsIgnoreCase("desc") 
            ? Sort.by(sortBy).descending() 
            : Sort.by(sortBy).ascending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<ApplicationResponse> response;
        if (status != null || businessUnitId != null || name != null) {
            response = applicationService.search(status, businessUnitId, name, pageable);
        } else {
            response = applicationService.findAll(pageable);
        }
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/by-status/{status}")
    @Operation(summary = "Filter by status", description = "Get applications by status")
    public ResponseEntity<Page<ApplicationResponse>> getByStatus(
            @PathVariable ApplicationStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<ApplicationResponse> response = applicationService.findByStatus(status, pageable);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/by-business-unit/{businessUnitId}")
    @Operation(summary = "Filter by business unit", description = "Get applications by business unit")
    public ResponseEntity<Page<ApplicationResponse>> getByBusinessUnit(
            @PathVariable UUID businessUnitId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<ApplicationResponse> response = applicationService.findByBusinessUnit(businessUnitId, pageable);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete application", description = "Delete an application")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        applicationService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
