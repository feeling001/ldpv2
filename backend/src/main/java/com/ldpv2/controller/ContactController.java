package com.ldpv2.controller;

import com.ldpv2.dto.request.CreateContactRequest;
import com.ldpv2.dto.response.ContactResponse;
import com.ldpv2.service.ContactService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/contacts")
@Tag(name = "Contacts", description = "Contact management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class ContactController {

    @Autowired
    private ContactService contactService;

    @PostMapping
    @Operation(summary = "Create contact", description = "Create a new contact")
    public ResponseEntity<ContactResponse> create(@Valid @RequestBody CreateContactRequest request) {
        ContactResponse response = contactService.create(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get contact", description = "Get contact by ID with persons")
    public ResponseEntity<ContactResponse> getById(@PathVariable UUID id) {
        ContactResponse response = contactService.findById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @Operation(summary = "List contacts", description = "Get all contacts")
    public ResponseEntity<List<ContactResponse>> getAll() {
        List<ContactResponse> response = contactService.findAll();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{contactId}/persons/{personId}")
    @Operation(summary = "Add person to contact", description = "Add a person to a contact")
    public ResponseEntity<ContactResponse> addPerson(
            @PathVariable UUID contactId,
            @PathVariable UUID personId,
            @RequestParam(defaultValue = "false") boolean isPrimary) {
        ContactResponse response = contactService.addPerson(contactId, personId, isPrimary);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{contactId}/persons/{personId}")
    @Operation(summary = "Remove person from contact", description = "Remove a person from a contact")
    public ResponseEntity<ContactResponse> removePerson(
            @PathVariable UUID contactId,
            @PathVariable UUID personId) {
        ContactResponse response = contactService.removePerson(contactId, personId);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{contactId}/persons/{personId}/primary")
    @Operation(summary = "Set primary person", description = "Set a person as primary contact")
    public ResponseEntity<ContactResponse> setPrimary(
            @PathVariable UUID contactId,
            @PathVariable UUID personId) {
        ContactResponse response = contactService.setPrimary(contactId, personId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete contact", description = "Delete a contact")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        contactService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
