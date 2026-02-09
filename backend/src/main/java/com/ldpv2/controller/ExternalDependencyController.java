package com.ldpv2.controller;

import com.ldpv2.dto.request.CreateExternalDependencyRequest;
import com.ldpv2.dto.request.UpdateExternalDependencyRequest;
import com.ldpv2.dto.response.ExternalDependencyResponse;
import com.ldpv2.service.ExternalDependencyService;
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

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/dependencies")
@Tag(name = "External Dependencies", description = "External dependency management")
@SecurityRequirement(name = "bearerAuth")
public class ExternalDependencyController {

    @Autowired
    private ExternalDependencyService externalDependencyService;

    @PostMapping("/for-application/{applicationId}")
    @Operation(summary = "Create dependency", description = "Create external dependency for application")
    public ResponseEntity<ExternalDependencyResponse> create(
            @PathVariable UUID applicationId,
            @Valid @RequestBody CreateExternalDependencyRequest request) {
        ExternalDependencyResponse response = externalDependencyService.create(applicationId, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update dependency", description = "Update external dependency")
    public ResponseEntity<ExternalDependencyResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateExternalDependencyRequest request) {
        ExternalDependencyResponse response = externalDependencyService.update(id, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get dependency", description = "Get external dependency by ID")
    public ResponseEntity<ExternalDependencyResponse> getById(@PathVariable UUID id) {
        ExternalDependencyResponse response = externalDependencyService.findById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @Operation(summary = "List dependencies", description = "Get all dependencies with filters")
    public ResponseEntity<Page<ExternalDependencyResponse>> getAll(
            @RequestParam(required = false) UUID applicationId,
            @RequestParam(required = false) UUID dependencyTypeId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection) {
        
        Sort sort = sortDirection.equalsIgnoreCase("desc") 
            ? Sort.by(sortBy).descending() 
            : Sort.by(sortBy).ascending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<ExternalDependencyResponse> response;
        if (applicationId != null || dependencyTypeId != null || status != null) {
            response = externalDependencyService.search(applicationId, dependencyTypeId, status, pageable);
        } else {
            response = externalDependencyService.findAll(pageable);
        }
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/by-application/{applicationId}")
    @Operation(summary = "Get dependencies by application", description = "Get all dependencies for an application")
    public ResponseEntity<Page<ExternalDependencyResponse>> getByApplication(
            @PathVariable UUID applicationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        Page<ExternalDependencyResponse> response = externalDependencyService.findByApplication(applicationId, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/expiring")
    @Operation(summary = "Get expiring dependencies", description = "Get dependencies expiring within specified days")
    public ResponseEntity<List<ExternalDependencyResponse>> getExpiring(
            @RequestParam(defaultValue = "30") int days) {
        List<ExternalDependencyResponse> response = externalDependencyService.findExpiring(days);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/expired")
    @Operation(summary = "Get expired dependencies", description = "Get all expired dependencies")
    public ResponseEntity<List<ExternalDependencyResponse>> getExpired() {
        List<ExternalDependencyResponse> response = externalDependencyService.findExpired();
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete dependency", description = "Delete external dependency")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        externalDependencyService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
