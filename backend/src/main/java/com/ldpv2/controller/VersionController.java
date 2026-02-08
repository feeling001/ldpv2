package com.ldpv2.controller;

import com.ldpv2.dto.request.CreateVersionRequest;
import com.ldpv2.dto.request.UpdateVersionRequest;
import com.ldpv2.dto.response.VersionResponse;
import com.ldpv2.service.VersionService;
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

import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/applications/{applicationId}/versions")
@Tag(name = "Versions", description = "Version management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class VersionController {

    @Autowired
    private VersionService versionService;

    @PostMapping
    @Operation(summary = "Create version", description = "Create a new version for an application")
    public ResponseEntity<VersionResponse> create(
            @PathVariable UUID applicationId,
            @Valid @RequestBody CreateVersionRequest request) {
        VersionResponse response = versionService.create(applicationId, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update version", description = "Update an existing version")
    public ResponseEntity<VersionResponse> update(
            @PathVariable UUID applicationId,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateVersionRequest request) {
        VersionResponse response = versionService.update(id, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get version", description = "Get version by ID")
    public ResponseEntity<VersionResponse> getById(
            @PathVariable UUID applicationId,
            @PathVariable UUID id) {
        VersionResponse response = versionService.findById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @Operation(summary = "List versions", description = "Get all versions for an application")
    public ResponseEntity<Page<VersionResponse>> getAll(
            @PathVariable UUID applicationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "releaseDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {
        
        Sort sort = sortDirection.equalsIgnoreCase("desc") 
            ? Sort.by(sortBy).descending() 
            : Sort.by(sortBy).ascending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<VersionResponse> response = versionService.findByApplication(applicationId, pageable);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/latest")
    @Operation(summary = "Get latest version", description = "Get the most recent version for an application")
    public ResponseEntity<VersionResponse> getLatest(@PathVariable UUID applicationId) {
        Optional<VersionResponse> response = versionService.findLatestByApplication(applicationId);
        return response.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete version", description = "Delete a version")
    public ResponseEntity<Void> delete(
            @PathVariable UUID applicationId,
            @PathVariable UUID id) {
        versionService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
