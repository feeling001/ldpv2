package com.ldpv2.controller;

import com.ldpv2.dto.request.CreateDependencyTypeRequest;
import com.ldpv2.dto.request.UpdateDependencyTypeRequest;
import com.ldpv2.dto.response.DependencyTypeResponse;
import com.ldpv2.service.DependencyTypeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/dependency-types")
@Tag(name = "Dependency Types", description = "Dependency type catalog management")
@SecurityRequirement(name = "bearerAuth")
public class DependencyTypeController {

    @Autowired
    private DependencyTypeService dependencyTypeService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create dependency type", description = "Create custom dependency type (Admin only)")
    public ResponseEntity<DependencyTypeResponse> create(@Valid @RequestBody CreateDependencyTypeRequest request) {
        DependencyTypeResponse response = dependencyTypeService.create(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update dependency type", description = "Update dependency type (Admin only)")
    public ResponseEntity<DependencyTypeResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateDependencyTypeRequest request) {
        DependencyTypeResponse response = dependencyTypeService.update(id, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get dependency type", description = "Get dependency type by ID")
    public ResponseEntity<DependencyTypeResponse> getById(@PathVariable UUID id) {
        DependencyTypeResponse response = dependencyTypeService.findById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @Operation(summary = "List dependency types", description = "Get all dependency types")
    public ResponseEntity<List<DependencyTypeResponse>> getAll() {
        List<DependencyTypeResponse> response = dependencyTypeService.findAll();
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete dependency type", description = "Delete dependency type (Admin only)")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        dependencyTypeService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
