package com.ldpv2.controller;

import com.ldpv2.dto.request.CreateContactRoleRequest;
import com.ldpv2.dto.response.ContactRoleResponse;
import com.ldpv2.service.ContactRoleService;
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

@RestController
@RequestMapping("/contact-roles")
@Tag(name = "Contact Roles", description = "Contact role management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class ContactRoleController {

    @Autowired
    private ContactRoleService contactRoleService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create contact role", description = "Create a new contact role (Admin only)")
    public ResponseEntity<ContactRoleResponse> create(@Valid @RequestBody CreateContactRoleRequest request) {
        ContactRoleResponse response = contactRoleService.create(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "List contact roles", description = "Get all contact roles")
    public ResponseEntity<List<ContactRoleResponse>> getAll() {
        List<ContactRoleResponse> response = contactRoleService.findAll();
        return ResponseEntity.ok(response);
    }
}
