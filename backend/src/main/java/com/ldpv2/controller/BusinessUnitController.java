package com.ldpv2.controller;

import com.ldpv2.dto.request.CreateBusinessUnitRequest;
import com.ldpv2.dto.request.UpdateBusinessUnitRequest;
import com.ldpv2.dto.response.BusinessUnitResponse;
import com.ldpv2.service.BusinessUnitService;
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
@RequestMapping("/business-units")
@Tag(name = "Business Units", description = "Business unit management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class BusinessUnitController {

    @Autowired
    private BusinessUnitService businessUnitService;

    @PostMapping
    @Operation(summary = "Create business unit", description = "Create a new business unit")
    public ResponseEntity<BusinessUnitResponse> create(@Valid @RequestBody CreateBusinessUnitRequest request) {
        BusinessUnitResponse response = businessUnitService.create(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update business unit", description = "Update an existing business unit")
    public ResponseEntity<BusinessUnitResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateBusinessUnitRequest request) {
        BusinessUnitResponse response = businessUnitService.update(id, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get business unit", description = "Get business unit by ID")
    public ResponseEntity<BusinessUnitResponse> getById(@PathVariable UUID id) {
        BusinessUnitResponse response = businessUnitService.findById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @Operation(summary = "List business units", description = "Get paginated list of business units")
    public ResponseEntity<Page<BusinessUnitResponse>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection) {
        
        Sort sort = sortDirection.equalsIgnoreCase("desc") 
            ? Sort.by(sortBy).descending() 
            : Sort.by(sortBy).ascending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<BusinessUnitResponse> response = businessUnitService.findAll(pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/search")
    @Operation(summary = "Search business units", description = "Search business units by name")
    public ResponseEntity<Page<BusinessUnitResponse>> search(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<BusinessUnitResponse> response = businessUnitService.search(q, pageable);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete business unit", description = "Delete a business unit")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        businessUnitService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
