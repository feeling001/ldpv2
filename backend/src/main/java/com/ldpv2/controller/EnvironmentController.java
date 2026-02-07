package com.ldpv2.controller;

import com.ldpv2.dto.request.CreateEnvironmentRequest;
import com.ldpv2.dto.request.UpdateEnvironmentRequest;
import com.ldpv2.dto.response.EnvironmentResponse;
import com.ldpv2.service.EnvironmentService;
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
@RequestMapping("/environments")
@Tag(name = "Environments", description = "Environment management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class EnvironmentController {

    @Autowired
    private EnvironmentService environmentService;

    @PostMapping
    @Operation(summary = "Create environment", description = "Create a new environment")
    public ResponseEntity<EnvironmentResponse> create(@Valid @RequestBody CreateEnvironmentRequest request) {
        EnvironmentResponse response = environmentService.create(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update environment", description = "Update an existing environment")
    public ResponseEntity<EnvironmentResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateEnvironmentRequest request) {
        EnvironmentResponse response = environmentService.update(id, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get environment", description = "Get environment by ID")
    public ResponseEntity<EnvironmentResponse> getById(@PathVariable UUID id) {
        EnvironmentResponse response = environmentService.findById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @Operation(summary = "List environments", description = "Get paginated list of environments")
    public ResponseEntity<Page<EnvironmentResponse>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection) {
        
        Sort sort = sortDirection.equalsIgnoreCase("desc") 
            ? Sort.by(sortBy).descending() 
            : Sort.by(sortBy).ascending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<EnvironmentResponse> response = environmentService.findAll(pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/search")
    @Operation(summary = "Search environments", description = "Search environments by name")
    public ResponseEntity<Page<EnvironmentResponse>> search(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<EnvironmentResponse> response = environmentService.search(query, pageable);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete environment", description = "Delete an environment")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        environmentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
