package com.ldpv2.controller;

import com.ldpv2.dto.request.CreatePersonRequest;
import com.ldpv2.dto.request.UpdatePersonRequest;
import com.ldpv2.dto.response.PersonResponse;
import com.ldpv2.service.PersonService;
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
@RequestMapping("/persons")
@Tag(name = "Persons", description = "Person management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class PersonController {

    @Autowired
    private PersonService personService;

    @PostMapping
    @Operation(summary = "Create person", description = "Create a new person")
    public ResponseEntity<PersonResponse> create(@Valid @RequestBody CreatePersonRequest request) {
        PersonResponse response = personService.create(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update person", description = "Update an existing person")
    public ResponseEntity<PersonResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdatePersonRequest request) {
        PersonResponse response = personService.update(id, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get person", description = "Get person by ID")
    public ResponseEntity<PersonResponse> getById(@PathVariable UUID id) {
        PersonResponse response = personService.findById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @Operation(summary = "List persons", description = "Get paginated list of persons")
    public ResponseEntity<Page<PersonResponse>> getAll(
            @RequestParam(required = false) String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "lastName") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection) {
        
        Sort sort = sortDirection.equalsIgnoreCase("desc") 
            ? Sort.by(sortBy).descending() 
            : Sort.by(sortBy).ascending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<PersonResponse> response = (name != null && !name.trim().isEmpty())
            ? personService.search(name, pageable)
            : personService.findAll(pageable);
        
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete person", description = "Delete a person")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        personService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
