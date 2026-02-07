#!/bin/bash

# Generate remaining backend files

BASE="/home/claude/ldpv2-monorepo/backend/src/main/java/com/ldpv2"

# ============= EXCEPTIONS =============
cat > "$BASE/exception/ResourceNotFoundException.java" << 'JAVA'
package com.ldpv2.exception;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
JAVA

cat > "$BASE/exception/BadRequestException.java" << 'JAVA'
package com.ldpv2.exception;

public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}
JAVA

cat > "$BASE/exception/GlobalExceptionHandler.java" << 'JAVA'
package com.ldpv2.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleResourceNotFound(ResourceNotFoundException ex) {
        Map<String, Object> error = new HashMap<>();
        error.put("timestamp", LocalDateTime.now());
        error.put("status", HttpStatus.NOT_FOUND.value());
        error.put("message", ex.getMessage());
        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<Map<String, Object>> handleBadRequest(BadRequestException ex) {
        Map<String, Object> error = new HashMap<>();
        error.put("timestamp", LocalDateTime.now());
        error.put("status", HttpStatus.BAD_REQUEST.value());
        error.put("message", ex.getMessage());
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", LocalDateTime.now());
        response.put("status", HttpStatus.BAD_REQUEST.value());
        response.put("message", "Validation failed");
        response.put("errors", errors);

        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, Object>> handleBadCredentials(BadCredentialsException ex) {
        Map<String, Object> error = new HashMap<>();
        error.put("timestamp", LocalDateTime.now());
        error.put("status", HttpStatus.UNAUTHORIZED.value());
        error.put("message", "Invalid username or password");
        return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGlobalException(Exception ex) {
        Map<String, Object> error = new HashMap<>();
        error.put("timestamp", LocalDateTime.now());
        error.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        error.put("message", "An unexpected error occurred");
        error.put("details", ex.getMessage());
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
JAVA

echo "Exception handlers created"

# ============= SERVICES =============

cat > "$BASE/service/AuthService.java" << 'JAVA'
package com.ldpv2.service;

import com.ldpv2.domain.entity.User;
import com.ldpv2.dto.request.LoginRequest;
import com.ldpv2.dto.request.RegisterRequest;
import com.ldpv2.dto.response.AuthResponse;
import com.ldpv2.dto.response.UserResponse;
import com.ldpv2.exception.BadRequestException;
import com.ldpv2.repository.UserRepository;
import com.ldpv2.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Check if username exists
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username already exists");
        }

        // Check if email exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already exists");
        }

        // Create new user
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("USER");

        user = userRepository.save(user);

        // Authenticate the user
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = tokenProvider.generateToken(authentication);

        return new AuthResponse(token, mapToUserResponse(user));
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = tokenProvider.generateToken(authentication);

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BadRequestException("User not found"));

        return new AuthResponse(token, mapToUserResponse(user));
    }

    private UserResponse mapToUserResponse(User user) {
        return new UserResponse(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getRole(),
            user.getCreatedAt(),
            user.getUpdatedAt()
        );
    }
}
JAVA

cat > "$BASE/service/EnvironmentService.java" << 'JAVA'
package com.ldpv2.service;

import com.ldpv2.domain.entity.Environment;
import com.ldpv2.dto.request.CreateEnvironmentRequest;
import com.ldpv2.dto.request.UpdateEnvironmentRequest;
import com.ldpv2.dto.response.EnvironmentResponse;
import com.ldpv2.exception.BadRequestException;
import com.ldpv2.exception.ResourceNotFoundException;
import com.ldpv2.repository.EnvironmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class EnvironmentService {

    @Autowired
    private EnvironmentRepository environmentRepository;

    @Transactional
    public EnvironmentResponse create(CreateEnvironmentRequest request) {
        // Check if name already exists
        if (environmentRepository.existsByName(request.getName())) {
            throw new BadRequestException("Environment with name '" + request.getName() + "' already exists");
        }

        Environment environment = new Environment();
        environment.setName(request.getName());
        environment.setDescription(request.getDescription());
        environment.setIsProduction(request.getIsProduction() != null ? request.getIsProduction() : false);
        environment.setCriticalityLevel(request.getCriticalityLevel());

        environment = environmentRepository.save(environment);
        return mapToResponse(environment);
    }

    @Transactional
    public EnvironmentResponse update(UUID id, UpdateEnvironmentRequest request) {
        Environment environment = environmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Environment not found with id: " + id));

        // Check if new name already exists (excluding current environment)
        if (request.getName() != null && !request.getName().equals(environment.getName())) {
            if (environmentRepository.existsByName(request.getName())) {
                throw new BadRequestException("Environment with name '" + request.getName() + "' already exists");
            }
            environment.setName(request.getName());
        }

        if (request.getDescription() != null) {
            environment.setDescription(request.getDescription());
        }

        if (request.getIsProduction() != null) {
            environment.setIsProduction(request.getIsProduction());
        }

        if (request.getCriticalityLevel() != null) {
            environment.setCriticalityLevel(request.getCriticalityLevel());
        }

        environment = environmentRepository.save(environment);
        return mapToResponse(environment);
    }

    public EnvironmentResponse findById(UUID id) {
        Environment environment = environmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Environment not found with id: " + id));
        return mapToResponse(environment);
    }

    public Page<EnvironmentResponse> findAll(Pageable pageable) {
        return environmentRepository.findAll(pageable).map(this::mapToResponse);
    }

    public Page<EnvironmentResponse> search(String query, Pageable pageable) {
        return environmentRepository.findByNameContainingIgnoreCase(query, pageable)
                .map(this::mapToResponse);
    }

    @Transactional
    public void delete(UUID id) {
        if (!environmentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Environment not found with id: " + id);
        }
        environmentRepository.deleteById(id);
    }

    private EnvironmentResponse mapToResponse(Environment environment) {
        return new EnvironmentResponse(
            environment.getId(),
            environment.getName(),
            environment.getDescription(),
            environment.getIsProduction(),
            environment.getCriticalityLevel(),
            environment.getCreatedAt(),
            environment.getUpdatedAt()
        );
    }
}
JAVA

echo "Services created"

# ============= CONTROLLERS =============

cat > "$BASE/controller/AuthController.java" << 'JAVA'
package com.ldpv2.controller;

import com.ldpv2.dto.request.LoginRequest;
import com.ldpv2.dto.request.RegisterRequest;
import com.ldpv2.dto.response.AuthResponse;
import com.ldpv2.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@Tag(name = "Authentication", description = "Authentication and registration endpoints")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register new user", description = "Create a new user account")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    @Operation(summary = "Login", description = "Authenticate and receive JWT token")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }
}
JAVA

cat > "$BASE/controller/EnvironmentController.java" << 'JAVA'
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
JAVA

echo "Controllers created"
echo "✓ All backend Java files created successfully!"

