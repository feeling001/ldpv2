#!/bin/bash

# ============================================================================
# LDPv2 - Story 2: Applications Implementation + Dashboard
# ============================================================================

echo "🚀 Starting deployment of Story 2 (Applications) and Dashboard..."

BASE_BACKEND="backend/src/main/java/com/ldpv2"
BASE_FRONTEND="frontend/src/app"
BASE_RESOURCES="backend/src/main/resources"

# ============================================================================
# BACKEND - Database Migration
# ============================================================================

echo "📦 Creating database migration for Application entity..."

mkdir -p "$BASE_RESOURCES/db/changelog/v1.0"

cat > "$BASE_RESOURCES/db/changelog/v1.0/004-create-application-table.xml" << 'XML'
<?xml version="1.0" encoding="UTF-8"?>
<databaseChangeLog
    xmlns="http://www.liquibase.org/xml/ns/dbchangelog"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.liquibase.org/xml/ns/dbchangelog
    http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-latest.xsd">

    <changeSet id="004-create-application-table" author="ldpv2-team">
        
        <!-- Create application table -->
        <createTable tableName="application">
            <column name="id" type="UUID" defaultValueComputed="uuid_generate_v4()">
                <constraints primaryKey="true" nullable="false"/>
            </column>
            <column name="name" type="VARCHAR(255)">
                <constraints nullable="false"/>
            </column>
            <column name="description" type="TEXT"/>
            <column name="status" type="VARCHAR(50)">
                <constraints nullable="false"/>
            </column>
            <column name="business_unit_id" type="UUID">
                <constraints nullable="false" foreignKeyName="fk_application_business_unit" 
                             references="business_unit(id)"/>
            </column>
            <column name="end_of_life_date" type="DATE"/>
            <column name="end_of_support_date" type="DATE"/>
            <column name="created_at" type="TIMESTAMP" defaultValueComputed="CURRENT_TIMESTAMP">
                <constraints nullable="false"/>
            </column>
            <column name="updated_at" type="TIMESTAMP" defaultValueComputed="CURRENT_TIMESTAMP">
                <constraints nullable="false"/>
            </column>
        </createTable>

        <!-- Create indexes -->
        <createIndex tableName="application" indexName="idx_application_status">
            <column name="status"/>
        </createIndex>

        <createIndex tableName="application" indexName="idx_application_business_unit">
            <column name="business_unit_id"/>
        </createIndex>

        <createIndex tableName="application" indexName="idx_application_name">
            <column name="name"/>
        </createIndex>

        <!-- Insert sample data -->
        <insert tableName="application">
            <column name="name" value="Customer Portal"/>
            <column name="description" value="External customer-facing portal for self-service"/>
            <column name="status" value="IN_SERVICE"/>
            <column name="business_unit_id" valueComputed="(SELECT id FROM business_unit WHERE name = 'Digital Services')"/>
            <column name="end_of_support_date" value="2028-12-31"/>
            <column name="end_of_life_date" value="2030-12-31"/>
        </insert>

        <insert tableName="application">
            <column name="name" value="Internal CRM"/>
            <column name="description" value="Customer relationship management system"/>
            <column name="status" value="IN_SERVICE"/>
            <column name="business_unit_id" valueComputed="(SELECT id FROM business_unit WHERE name = 'Operations')"/>
        </insert>

        <insert tableName="application">
            <column name="name" value="Mobile App"/>
            <column name="description" value="Mobile application for iOS and Android"/>
            <column name="status" value="IN_DEVELOPMENT"/>
            <column name="business_unit_id" valueComputed="(SELECT id FROM business_unit WHERE name = 'Digital Services')"/>
        </insert>

        <insert tableName="application">
            <column name="name" value="HR Management System"/>
            <column name="description" value="Employee management and payroll system"/>
            <column name="status" value="IN_SERVICE"/>
            <column name="business_unit_id" valueComputed="(SELECT id FROM business_unit WHERE name = 'Human Resources')"/>
            <column name="end_of_support_date" value="2026-06-30"/>
            <column name="end_of_life_date" value="2027-06-30"/>
        </insert>

        <insert tableName="application">
            <column name="name" value="Analytics Platform"/>
            <column name="description" value="Business intelligence and analytics platform"/>
            <column name="status" value="IDEA"/>
            <column name="business_unit_id" valueComputed="(SELECT id FROM business_unit WHERE name = 'Finance')"/>
        </insert>
        
    </changeSet>
    
</databaseChangeLog>
XML

# Update master changelog
cat > "$BASE_RESOURCES/db/changelog/db.changelog-master.xml" << 'XML'
<?xml version="1.0" encoding="UTF-8"?>
<databaseChangeLog
    xmlns="http://www.liquibase.org/xml/ns/dbchangelog"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.liquibase.org/xml/ns/dbchangelog
    http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-latest.xsd">

    <!-- Story 0: Foundation -->
    <include file="db/changelog/v1.0/001-create-user-table.xml"/>
    <include file="db/changelog/v1.0/002-create-environment-table.xml"/>
    <include file="db/changelog/data/initial-data.xml"/>
    
    <!-- Story 1: Business Units -->
    <include file="db/changelog/v1.0/003-create-business-unit-table.xml"/>
    
    <!-- Story 2: Applications -->
    <include file="db/changelog/v1.0/004-create-application-table.xml"/>
    
</databaseChangeLog>
XML

# ============================================================================
# BACKEND - Enum
# ============================================================================

echo "📦 Creating ApplicationStatus enum..."

mkdir -p "$BASE_BACKEND/domain/enums"

cat > "$BASE_BACKEND/domain/enums/ApplicationStatus.java" << 'JAVA'
package com.ldpv2.domain.enums;

public enum ApplicationStatus {
    IDEA("Idea"),
    IN_DEVELOPMENT("In Development"),
    IN_SERVICE("In Service"),
    MAINTENANCE("Maintenance"),
    DECOMMISSIONED("Decommissioned");
    
    private final String displayName;
    
    ApplicationStatus(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}
JAVA

# ============================================================================
# BACKEND - Entity
# ============================================================================

echo "📦 Creating Application entity..."

cat > "$BASE_BACKEND/domain/entity/Application.java" << 'JAVA'
package com.ldpv2.domain.entity;

import com.ldpv2.domain.enums.ApplicationStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Application entity representing software systems
 */
@Data
@Entity
@Table(name = "application")
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Application extends BaseEntity {

    @Column(nullable = false, length = 255)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private ApplicationStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_unit_id", nullable = false)
    private BusinessUnit businessUnit;

    @Column(name = "end_of_life_date")
    private LocalDate endOfLifeDate;

    @Column(name = "end_of_support_date")
    private LocalDate endOfSupportDate;
}
JAVA

# ============================================================================
# BACKEND - Repository
# ============================================================================

echo "📦 Creating Application repository..."

mkdir -p "$BASE_BACKEND/repository"

cat > "$BASE_BACKEND/repository/ApplicationRepository.java" << 'JAVA'
package com.ldpv2.repository;

import com.ldpv2.domain.entity.Application;
import com.ldpv2.domain.enums.ApplicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, UUID> {
    Page<Application> findByStatus(ApplicationStatus status, Pageable pageable);
    Page<Application> findByBusinessUnitId(UUID businessUnitId, Pageable pageable);
    Page<Application> findByNameContainingIgnoreCase(String name, Pageable pageable);
    Page<Application> findByStatusAndBusinessUnitId(ApplicationStatus status, UUID businessUnitId, Pageable pageable);
    
    @Query("SELECT a FROM Application a WHERE " +
           "(:status IS NULL OR a.status = :status) AND " +
           "(:businessUnitId IS NULL OR a.businessUnit.id = :businessUnitId) AND " +
           "(:name IS NULL OR LOWER(a.name) LIKE LOWER(CONCAT('%', :name, '%')))")
    Page<Application> search(
        @Param("status") ApplicationStatus status,
        @Param("businessUnitId") UUID businessUnitId,
        @Param("name") String name,
        Pageable pageable
    );
}
JAVA

# ============================================================================
# BACKEND - DTOs
# ============================================================================

echo "📦 Creating Application DTOs..."

mkdir -p "$BASE_BACKEND/dto/request"
mkdir -p "$BASE_BACKEND/dto/response"

cat > "$BASE_BACKEND/dto/request/CreateApplicationRequest.java" << 'JAVA'
package com.ldpv2.dto.request;

import com.ldpv2.domain.enums.ApplicationStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateApplicationRequest {
    
    @NotBlank(message = "Name is required")
    @Size(max = 255, message = "Name must not exceed 255 characters")
    private String name;
    
    private String description;
    
    @NotNull(message = "Status is required")
    private ApplicationStatus status;
    
    @NotNull(message = "Business unit is required")
    private UUID businessUnitId;
    
    private LocalDate endOfLifeDate;
    
    private LocalDate endOfSupportDate;
}
JAVA

cat > "$BASE_BACKEND/dto/request/UpdateApplicationRequest.java" << 'JAVA'
package com.ldpv2.dto.request;

import com.ldpv2.domain.enums.ApplicationStatus;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateApplicationRequest {
    
    @Size(max = 255, message = "Name must not exceed 255 characters")
    private String name;
    
    private String description;
    
    private ApplicationStatus status;
    
    private UUID businessUnitId;
    
    private LocalDate endOfLifeDate;
    
    private LocalDate endOfSupportDate;
}
JAVA

cat > "$BASE_BACKEND/dto/response/ApplicationResponse.java" << 'JAVA'
package com.ldpv2.dto.response;

import com.ldpv2.domain.enums.ApplicationStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationResponse {
    private UUID id;
    private String name;
    private String description;
    private ApplicationStatus status;
    private BusinessUnitSummaryResponse businessUnit;
    private LocalDate endOfLifeDate;
    private LocalDate endOfSupportDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
JAVA

cat > "$BASE_BACKEND/dto/response/ApplicationSummaryResponse.java" << 'JAVA'
package com.ldpv2.dto.response;

import com.ldpv2.domain.enums.ApplicationStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationSummaryResponse {
    private UUID id;
    private String name;
    private ApplicationStatus status;
    private String businessUnitName;
}
JAVA

# ============================================================================
# BACKEND - Service
# ============================================================================

echo "📦 Creating Application service..."

cat > "$BASE_BACKEND/service/ApplicationService.java" << 'JAVA'
package com.ldpv2.service;

import com.ldpv2.domain.entity.Application;
import com.ldpv2.domain.entity.BusinessUnit;
import com.ldpv2.domain.enums.ApplicationStatus;
import com.ldpv2.dto.request.CreateApplicationRequest;
import com.ldpv2.dto.request.UpdateApplicationRequest;
import com.ldpv2.dto.response.ApplicationResponse;
import com.ldpv2.dto.response.BusinessUnitSummaryResponse;
import com.ldpv2.exception.BadRequestException;
import com.ldpv2.exception.ResourceNotFoundException;
import com.ldpv2.repository.ApplicationRepository;
import com.ldpv2.repository.BusinessUnitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class ApplicationService {

    @Autowired
    private ApplicationRepository applicationRepository;
    
    @Autowired
    private BusinessUnitRepository businessUnitRepository;

    @Transactional
    public ApplicationResponse create(CreateApplicationRequest request) {
        // Validate business unit exists
        BusinessUnit businessUnit = businessUnitRepository.findById(request.getBusinessUnitId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Business unit not found with id: " + request.getBusinessUnitId()));
        
        // Validate dates if both are provided
        if (request.getEndOfSupportDate() != null && request.getEndOfLifeDate() != null) {
            if (request.getEndOfSupportDate().isAfter(request.getEndOfLifeDate())) {
                throw new BadRequestException(
                        "End of support date must be before end of life date");
            }
        }

        Application application = new Application();
        application.setName(request.getName());
        application.setDescription(request.getDescription());
        application.setStatus(request.getStatus());
        application.setBusinessUnit(businessUnit);
        application.setEndOfLifeDate(request.getEndOfLifeDate());
        application.setEndOfSupportDate(request.getEndOfSupportDate());

        application = applicationRepository.save(application);
        return mapToResponse(application);
    }

    @Transactional
    public ApplicationResponse update(UUID id, UpdateApplicationRequest request) {
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Application not found with id: " + id));

        if (request.getName() != null) {
            application.setName(request.getName());
        }
        
        if (request.getDescription() != null) {
            application.setDescription(request.getDescription());
        }
        
        if (request.getStatus() != null) {
            application.setStatus(request.getStatus());
        }
        
        if (request.getBusinessUnitId() != null) {
            BusinessUnit businessUnit = businessUnitRepository.findById(request.getBusinessUnitId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Business unit not found with id: " + request.getBusinessUnitId()));
            application.setBusinessUnit(businessUnit);
        }
        
        if (request.getEndOfLifeDate() != null) {
            application.setEndOfLifeDate(request.getEndOfLifeDate());
        }
        
        if (request.getEndOfSupportDate() != null) {
            application.setEndOfSupportDate(request.getEndOfSupportDate());
        }
        
        // Validate dates if both are set
        if (application.getEndOfSupportDate() != null && application.getEndOfLifeDate() != null) {
            if (application.getEndOfSupportDate().isAfter(application.getEndOfLifeDate())) {
                throw new BadRequestException(
                        "End of support date must be before end of life date");
            }
        }

        application = applicationRepository.save(application);
        return mapToResponse(application);
    }
    
    @Transactional
    public ApplicationResponse updateStatus(UUID id, ApplicationStatus newStatus) {
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Application not found with id: " + id));
        
        application.setStatus(newStatus);
        application = applicationRepository.save(application);
        return mapToResponse(application);
    }

    public ApplicationResponse findById(UUID id) {
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Application not found with id: " + id));
        return mapToResponse(application);
    }

    public Page<ApplicationResponse> findAll(Pageable pageable) {
        return applicationRepository.findAll(pageable).map(this::mapToResponse);
    }
    
    public Page<ApplicationResponse> findByStatus(ApplicationStatus status, Pageable pageable) {
        return applicationRepository.findByStatus(status, pageable).map(this::mapToResponse);
    }
    
    public Page<ApplicationResponse> findByBusinessUnit(UUID businessUnitId, Pageable pageable) {
        return applicationRepository.findByBusinessUnitId(businessUnitId, pageable)
                .map(this::mapToResponse);
    }

    public Page<ApplicationResponse> search(ApplicationStatus status, UUID businessUnitId, 
                                           String name, Pageable pageable) {
        return applicationRepository.search(status, businessUnitId, name, pageable)
                .map(this::mapToResponse);
    }

    @Transactional
    public void delete(UUID id) {
        if (!applicationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Application not found with id: " + id);
        }
        applicationRepository.deleteById(id);
    }

    private ApplicationResponse mapToResponse(Application application) {
        BusinessUnitSummaryResponse buSummary = new BusinessUnitSummaryResponse(
            application.getBusinessUnit().getId(),
            application.getBusinessUnit().getName()
        );
        
        return new ApplicationResponse(
            application.getId(),
            application.getName(),
            application.getDescription(),
            application.getStatus(),
            buSummary,
            application.getEndOfLifeDate(),
            application.getEndOfSupportDate(),
            application.getCreatedAt(),
            application.getUpdatedAt()
        );
    }
}
JAVA

# ============================================================================
# BACKEND - Controller
# ============================================================================

echo "📦 Creating Application controller..."

cat > "$BASE_BACKEND/controller/ApplicationController.java" << 'JAVA'
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
JAVA

# ============================================================================
# FRONTEND - Models
# ============================================================================

echo "📦 Creating Application models..."

mkdir -p "$BASE_FRONTEND/shared/models"

cat > "$BASE_FRONTEND/shared/models/application.model.ts" << 'TS'
export enum ApplicationStatus {
  IDEA = 'IDEA',
  IN_DEVELOPMENT = 'IN_DEVELOPMENT',
  IN_SERVICE = 'IN_SERVICE',
  MAINTENANCE = 'MAINTENANCE',
  DECOMMISSIONED = 'DECOMMISSIONED'
}

export interface Application {
  id: string;
  name: string;
  description?: string;
  status: ApplicationStatus;
  businessUnit: { id: string; name: string };
  endOfLifeDate?: Date;
  endOfSupportDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateApplicationRequest {
  name: string;
  description?: string;
  status: ApplicationStatus;
  businessUnitId: string;
  endOfLifeDate?: Date;
  endOfSupportDate?: Date;
}

export interface UpdateApplicationRequest {
  name?: string;
  description?: string;
  status?: ApplicationStatus;
  businessUnitId?: string;
  endOfLifeDate?: Date;
  endOfSupportDate?: Date;
}
TS

# ============================================================================
# FRONTEND - Service
# ============================================================================

echo "📦 Creating Application service..."

mkdir -p "$BASE_FRONTEND/features/applications"

cat > "$BASE_FRONTEND/features/applications/application.service.ts" << 'TS'
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Application,
  ApplicationStatus,
  CreateApplicationRequest,
  UpdateApplicationRequest
} from '../../shared/models/application.model';
import { Page } from '../../shared/models/environment.model';

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {
  private readonly API_URL = '/api/applications';

  constructor(private http: HttpClient) {}

  getApplications(
    filters?: {
      status?: ApplicationStatus;
      businessUnitId?: string;
      name?: string;
    },
    page: number = 0,
    size: number = 20,
    sortBy: string = 'name',
    sortDirection: string = 'asc'
  ): Observable<Page<Application>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDirection', sortDirection);

    if (filters?.status) {
      params = params.set('status', filters.status);
    }
    if (filters?.businessUnitId) {
      params = params.set('businessUnitId', filters.businessUnitId);
    }
    if (filters?.name) {
      params = params.set('name', filters.name);
    }

    return this.http.get<Page<Application>>(this.API_URL, { params });
  }

  getApplication(id: string): Observable<Application> {
    return this.http.get<Application>(`${this.API_URL}/${id}`);
  }

  createApplication(data: CreateApplicationRequest): Observable<Application> {
    return this.http.post<Application>(this.API_URL, data);
  }

  updateApplication(id: string, data: UpdateApplicationRequest): Observable<Application> {
    return this.http.put<Application>(`${this.API_URL}/${id}`, data);
  }

  updateStatus(id: string, status: ApplicationStatus): Observable<Application> {
    return this.http.patch<Application>(`${this.API_URL}/${id}/status`, null, {
      params: { status }
    });
  }

  deleteApplication(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
TS

# ============================================================================
# FRONTEND - Components (Application List)
# ============================================================================

echo "📦 Creating Application List component..."

mkdir -p "$BASE_FRONTEND/features/applications/application-list"

cat > "$BASE_FRONTEND/features/applications/application-list/application-list.component.ts" << 'TS'
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { ApplicationService } from '../application.service';
import { BusinessUnitService } from '../../business-units/business-unit.service';
import { Application, ApplicationStatus } from '../../../shared/models/application.model';
import { BusinessUnit } from '../../../shared/models/business-unit.model';
import { Page } from '../../../shared/models/environment.model';

@Component({
  selector: 'app-application-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './application-list.component.html',
  styleUrls: ['./application-list.component.scss']
})
export class ApplicationListComponent implements OnInit {
  applications: Application[] = [];
  businessUnits: BusinessUnit[] = [];
  loading = false;
  error = '';
  
  page = 0;
  size = 20;
  totalElements = 0;
  totalPages = 0;

  // Filters
  searchQuery = '';
  selectedStatus: ApplicationStatus | '' = '';
  selectedBusinessUnitId = '';
  
  // Status options
  statusOptions = Object.values(ApplicationStatus);
  ApplicationStatus = ApplicationStatus;
  
  private searchSubject = new Subject<string>();

  constructor(
    private applicationService: ApplicationService,
    private businessUnitService: BusinessUnitService,
    private router: Router
  ) {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.page = 0;
      this.loadApplications();
    });
  }

  ngOnInit(): void {
    this.loadBusinessUnits();
    this.loadApplications();
  }

  loadBusinessUnits(): void {
    this.businessUnitService.getBusinessUnits(0, 100).subscribe({
      next: (data) => {
        this.businessUnits = data.content;
      },
      error: () => {
        // Silent fail for filters
      }
    });
  }

  loadApplications(): void {
    this.loading = true;
    
    const filters = {
      status: this.selectedStatus || undefined,
      businessUnitId: this.selectedBusinessUnitId || undefined,
      name: this.searchQuery || undefined
    };

    this.applicationService.getApplications(filters, this.page, this.size).subscribe({
      next: (data: Page<Application>) => {
        this.applications = data.content;
        this.totalElements = data.totalElements;
        this.totalPages = data.totalPages;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load applications';
        this.loading = false;
      }
    });
  }

  onSearchChange(query: string): void {
    this.searchQuery = query;
    this.searchSubject.next(query);
  }

  onFilterChange(): void {
    this.page = 0;
    this.loadApplications();
  }

  createNew(): void {
    this.router.navigate(['/applications/new']);
  }

  viewDetails(id: string): void {
    this.router.navigate(['/applications', id]);
  }

  edit(id: string): void {
    this.router.navigate(['/applications', id, 'edit']);
  }

  changeStatus(id: string, newStatus: ApplicationStatus): void {
    this.applicationService.updateStatus(id, newStatus).subscribe({
      next: () => {
        this.loadApplications();
      },
      error: (err) => {
        this.error = 'Failed to update status';
      }
    });
  }

  delete(id: string): void {
    if (confirm('Are you sure you want to delete this application?')) {
      this.applicationService.deleteApplication(id).subscribe({
        next: () => {
          this.loadApplications();
        },
        error: (err) => {
          this.error = 'Failed to delete application';
        }
      });
    }
  }

  getStatusClass(status: ApplicationStatus): string {
    const classes: { [key in ApplicationStatus]: string } = {
      [ApplicationStatus.IDEA]: 'status-idea',
      [ApplicationStatus.IN_DEVELOPMENT]: 'status-in-development',
      [ApplicationStatus.IN_SERVICE]: 'status-in-service',
      [ApplicationStatus.MAINTENANCE]: 'status-maintenance',
      [ApplicationStatus.DECOMMISSIONED]: 'status-decommissioned'
    };
    return classes[status];
  }

  getStatusDisplay(status: ApplicationStatus): string {
    const displays: { [key in ApplicationStatus]: string } = {
      [ApplicationStatus.IDEA]: 'Idea',
      [ApplicationStatus.IN_DEVELOPMENT]: 'In Development',
      [ApplicationStatus.IN_SERVICE]: 'In Service',
      [ApplicationStatus.MAINTENANCE]: 'Maintenance',
      [ApplicationStatus.DECOMMISSIONED]: 'Decommissioned'
    };
    return displays[status];
  }

  nextPage(): void {
    if (this.page < this.totalPages - 1) {
      this.page++;
      this.loadApplications();
    }
  }

  previousPage(): void {
    if (this.page > 0) {
      this.page--;
      this.loadApplications();
    }
  }
}
TS

cat > "$BASE_FRONTEND/features/applications/application-list/application-list.component.html" << 'HTML'
<div class="container">
  <div class="header">
    <h1>Applications</h1>
    <button (click)="createNew()" class="btn-primary">Create New Application</button>
  </div>

  <div class="filters">
    <div class="filter-row">
      <div class="filter-group">
        <label>Search by name:</label>
        <input 
          type="text" 
          [(ngModel)]="searchQuery"
          (ngModelChange)="onSearchChange($event)"
          placeholder="Search applications..."
          class="search-input"
        />
      </div>

      <div class="filter-group">
        <label>Status:</label>
        <select [(ngModel)]="selectedStatus" (ngModelChange)="onFilterChange()" class="filter-select">
          <option value="">All Statuses</option>
          <option *ngFor="let status of statusOptions" [value]="status">
            {{ getStatusDisplay(status) }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label>Business Unit:</label>
        <select [(ngModel)]="selectedBusinessUnitId" (ngModelChange)="onFilterChange()" class="filter-select">
          <option value="">All Business Units</option>
          <option *ngFor="let bu of businessUnits" [value]="bu.id">
            {{ bu.name }}
          </option>
        </select>
      </div>
    </div>
  </div>

  <div *ngIf="loading" class="loading">Loading...</div>
  <div *ngIf="error" class="error">{{ error }}</div>

  <div *ngIf="!loading && applications.length > 0" class="table-container">
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Status</th>
          <th>Business Unit</th>
          <th>End of Life</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let app of applications">
          <td><strong>{{ app.name }}</strong></td>
          <td>
            <span class="status-badge" [ngClass]="getStatusClass(app.status)">
              {{ getStatusDisplay(app.status) }}
            </span>
          </td>
          <td>{{ app.businessUnit.name }}</td>
          <td>{{ app.endOfLifeDate ? (app.endOfLifeDate | date:'mediumDate') : '-' }}</td>
          <td class="actions">
            <button (click)="viewDetails(app.id)" class="btn-sm">View</button>
            <button (click)="edit(app.id)" class="btn-sm">Edit</button>
            <select 
              (change)="changeStatus(app.id, $any($event.target).value)" 
              class="btn-sm status-select"
              [value]="app.status">
              <option disabled selected>Change Status</option>
              <option *ngFor="let status of statusOptions" [value]="status">
                {{ getStatusDisplay(status) }}
              </option>
            </select>
            <button (click)="delete(app.id)" class="btn-sm btn-danger">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <div *ngIf="!loading && applications.length === 0" class="empty">
    No applications found. Click "Create New Application" to get started.
  </div>

  <div *ngIf="totalPages > 1" class="pagination">
    <button (click)="previousPage()" [disabled]="page === 0">Previous</button>
    <span>Page {{ page + 1 }} of {{ totalPages }} ({{ totalElements }} total)</span>
    <button (click)="nextPage()" [disabled]="page >= totalPages - 1">Next</button>
  </div>
</div>
HTML

cat > "$BASE_FRONTEND/features/applications/application-list/application-list.component.scss" << 'SCSS'
.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;

  h1 {
    margin: 0;
  }
}

.filters {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.filter-row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-group {
  flex: 1;
  min-width: 200px;

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #555;
  }

  .search-input,
  .filter-select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;

    &:focus {
      outline: none;
      border-color: #3f51b5;
    }
  }
}

.btn-primary {
  background-color: #3f51b5;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #303f9f;
  }
}

.loading, .error, .empty {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.error {
  color: #f44336;
}

.table-container {
  overflow-x: auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

table {
  width: 100%;
  border-collapse: collapse;

  th, td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }

  th {
    background-color: #f5f5f5;
    font-weight: 600;
  }

  tbody tr:hover {
    background-color: #f9f9f9;
  }
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
  
  &.status-idea {
    background-color: #e3f2fd;
    color: #1976d2;
  }
  
  &.status-in-development {
    background-color: #fff3e0;
    color: #f57c00;
  }
  
  &.status-in-service {
    background-color: #e8f5e9;
    color: #388e3c;
  }
  
  &.status-maintenance {
    background-color: #fff9c4;
    color: #f57f17;
  }
  
  &.status-decommissioned {
    background-color: #f5f5f5;
    color: #616161;
  }
}

.actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn-sm {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: #2196f3;
  color: white;
  font-size: 0.875rem;

  &:hover {
    background-color: #1976d2;
  }

  &.btn-danger {
    background-color: #f44336;

    &:hover {
      background-color: #d32f2f;
    }
  }
  
  &.status-select {
    background-color: #9c27b0;
    
    &:hover {
      background-color: #7b1fa2;
    }
  }
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;

  button {
    padding: 0.5rem 1rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: white;
    cursor: pointer;

    &:hover:not(:disabled) {
      background-color: #f5f5f5;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  span {
    color: #666;
  }
}
SCSS

# ============================================================================
# FRONTEND - Application Detail Component
# ============================================================================

echo "📦 Creating Application Detail component..."

mkdir -p "$BASE_FRONTEND/features/applications/application-detail"

cat > "$BASE_FRONTEND/features/applications/application-detail/application-detail.component.ts" << 'TS'
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ApplicationService } from '../application.service';
import { Application, ApplicationStatus } from '../../../shared/models/application.model';

@Component({
  selector: 'app-application-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './application-detail.component.html',
  styleUrls: ['./application-detail.component.scss']
})
export class ApplicationDetailComponent implements OnInit {
  application?: Application;
  loading = false;
  error = '';
  
  ApplicationStatus = ApplicationStatus;

  constructor(
    private applicationService: ApplicationService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadApplication(id);
    }
  }

  loadApplication(id: string): void {
    this.loading = true;
    this.applicationService.getApplication(id).subscribe({
      next: (app) => {
        this.application = app;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load application';
        this.loading = false;
      }
    });
  }

  edit(): void {
    if (this.application) {
      this.router.navigate(['/applications', this.application.id, 'edit']);
    }
  }

  delete(): void {
    if (this.application && confirm('Are you sure you want to delete this application?')) {
      this.applicationService.deleteApplication(this.application.id).subscribe({
        next: () => {
          this.router.navigate(['/applications']);
        },
        error: (err) => {
          this.error = 'Failed to delete application';
        }
      });
    }
  }

  back(): void {
    this.router.navigate(['/applications']);
  }

  getStatusClass(status: ApplicationStatus): string {
    const classes: { [key in ApplicationStatus]: string } = {
      [ApplicationStatus.IDEA]: 'status-idea',
      [ApplicationStatus.IN_DEVELOPMENT]: 'status-in-development',
      [ApplicationStatus.IN_SERVICE]: 'status-in-service',
      [ApplicationStatus.MAINTENANCE]: 'status-maintenance',
      [ApplicationStatus.DECOMMISSIONED]: 'status-decommissioned'
    };
    return classes[status];
  }

  getStatusDisplay(status: ApplicationStatus): string {
    const displays: { [key in ApplicationStatus]: string } = {
      [ApplicationStatus.IDEA]: 'Idea',
      [ApplicationStatus.IN_DEVELOPMENT]: 'In Development',
      [ApplicationStatus.IN_SERVICE]: 'In Service',
      [ApplicationStatus.MAINTENANCE]: 'Maintenance',
      [ApplicationStatus.DECOMMISSIONED]: 'Decommissioned'
    };
    return displays[status];
  }
}
TS

cat > "$BASE_FRONTEND/features/applications/application-detail/application-detail.component.html" << 'HTML'
<div class="container">
  <div *ngIf="loading" class="loading">Loading...</div>
  <div *ngIf="error" class="error">{{ error }}</div>

  <div *ngIf="application && !loading" class="detail-card">
    <div class="header">
      <h1>{{ application.name }}</h1>
      <div class="actions">
        <button (click)="edit()" class="btn-primary">Edit</button>
        <button (click)="delete()" class="btn-danger">Delete</button>
      </div>
    </div>

    <div class="details">
      <div class="detail-row">
        <label>Status:</label>
        <span class="status-badge" [ngClass]="getStatusClass(application.status)">
          {{ getStatusDisplay(application.status) }}
        </span>
      </div>

      <div class="detail-row">
        <label>Description:</label>
        <span>{{ application.description || '-' }}</span>
      </div>

      <div class="detail-row">
        <label>Business Unit:</label>
        <span>{{ application.businessUnit.name }}</span>
      </div>

      <div class="detail-row">
        <label>End of Support Date:</label>
        <span>{{ application.endOfSupportDate ? (application.endOfSupportDate | date:'mediumDate') : '-' }}</span>
      </div>

      <div class="detail-row">
        <label>End of Life Date:</label>
        <span>{{ application.endOfLifeDate ? (application.endOfLifeDate | date:'mediumDate') : '-' }}</span>
      </div>

      <div class="detail-row">
        <label>Created:</label>
        <span>{{ application.createdAt | date:'medium' }}</span>
      </div>

      <div class="detail-row">
        <label>Last Updated:</label>
        <span>{{ application.updatedAt | date:'medium' }}</span>
      </div>
    </div>

    <button (click)="back()" class="btn-secondary">Back to List</button>
  </div>
</div>
HTML

cat > "$BASE_FRONTEND/features/applications/application-detail/application-detail.component.scss" << 'SCSS'
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.loading, .error {
  text-align: center;
  padding: 2rem;
}

.error {
  color: #f44336;
}

.detail-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f5f5f5;

  h1 {
    margin: 0;
  }

  .actions {
    display: flex;
    gap: 0.5rem;
  }
}

.details {
  margin-bottom: 2rem;
}

.detail-row {
  display: flex;
  padding: 1rem 0;
  border-bottom: 1px solid #f5f5f5;

  label {
    font-weight: 600;
    width: 250px;
    color: #555;
  }

  span {
    flex: 1;
    color: #333;
  }
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
  
  &.status-idea {
    background-color: #e3f2fd;
    color: #1976d2;
  }
  
  &.status-in-development {
    background-color: #fff3e0;
    color: #f57c00;
  }
  
  &.status-in-service {
    background-color: #e8f5e9;
    color: #388e3c;
  }
  
  &.status-maintenance {
    background-color: #fff9c4;
    color: #f57f17;
  }
  
  &.status-decommissioned {
    background-color: #f5f5f5;
    color: #616161;
  }
}

.btn-primary, .btn-secondary, .btn-danger {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.btn-primary {
  background-color: #3f51b5;
  color: white;

  &:hover {
    background-color: #303f9f;
  }
}

.btn-secondary {
  background-color: #f5f5f5;
  color: #333;

  &:hover {
    background-color: #e0e0e0;
  }
}

.btn-danger {
  background-color: #f44336;
  color: white;

  &:hover {
    background-color: #d32f2f;
  }
}
SCSS

# ============================================================================
# FRONTEND - Application Form Component
# ============================================================================

echo "📦 Creating Application Form component..."

mkdir -p "$BASE_FRONTEND/features/applications/application-form"

cat > "$BASE_FRONTEND/features/applications/application-form/application-form.component.ts" << 'TS'
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ApplicationService } from '../application.service';
import { BusinessUnitService } from '../../business-units/business-unit.service';
import { ApplicationStatus } from '../../../shared/models/application.model';
import { BusinessUnit } from '../../../shared/models/business-unit.model';

@Component({
  selector: 'app-application-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './application-form.component.html',
  styleUrls: ['./application-form.component.scss']
})
export class ApplicationFormComponent implements OnInit {
  form: FormGroup;
  loading = false;
  error = '';
  isEditMode = false;
  applicationId?: string;
  
  businessUnits: BusinessUnit[] = [];
  statusOptions = Object.values(ApplicationStatus);
  ApplicationStatus = ApplicationStatus;

  constructor(
    private fb: FormBuilder,
    private applicationService: ApplicationService,
    private businessUnitService: BusinessUnitService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(255)]],
      description: [''],
      status: [ApplicationStatus.IDEA, [Validators.required]],
      businessUnitId: ['', [Validators.required]],
      endOfSupportDate: [''],
      endOfLifeDate: ['']
    });
  }

  ngOnInit(): void {
    this.loadBusinessUnits();
    
    this.applicationId = this.route.snapshot.paramMap.get('id') || undefined;
    this.isEditMode = !!this.applicationId;

    if (this.isEditMode && this.applicationId) {
      this.loadApplication(this.applicationId);
    }
  }

  loadBusinessUnits(): void {
    this.businessUnitService.getBusinessUnits(0, 100).subscribe({
      next: (data) => {
        this.businessUnits = data.content;
      },
      error: (err) => {
        this.error = 'Failed to load business units';
      }
    });
  }

  loadApplication(id: string): void {
    this.loading = true;
    this.applicationService.getApplication(id).subscribe({
      next: (app) => {
        this.form.patchValue({
          name: app.name,
          description: app.description,
          status: app.status,
          businessUnitId: app.businessUnit.id,
          endOfSupportDate: app.endOfSupportDate,
          endOfLifeDate: app.endOfLifeDate
        });
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load application';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      // Validate dates
      const endOfSupport = this.form.value.endOfSupportDate;
      const endOfLife = this.form.value.endOfLifeDate;
      
      if (endOfSupport && endOfLife) {
        const supportDate = new Date(endOfSupport);
        const lifeDate = new Date(endOfLife);
        
        if (supportDate > lifeDate) {
          this.error = 'End of support date must be before end of life date';
          return;
        }
      }

      this.loading = true;
      this.error = '';

      const request$ = this.isEditMode && this.applicationId
        ? this.applicationService.updateApplication(this.applicationId, this.form.value)
        : this.applicationService.createApplication(this.form.value);

      request$.subscribe({
        next: () => {
          this.router.navigate(['/applications']);
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to save application';
          this.loading = false;
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/applications']);
  }

  getStatusDisplay(status: ApplicationStatus): string {
    const displays: { [key in ApplicationStatus]: string } = {
      [ApplicationStatus.IDEA]: 'Idea',
      [ApplicationStatus.IN_DEVELOPMENT]: 'In Development',
      [ApplicationStatus.IN_SERVICE]: 'In Service',
      [ApplicationStatus.MAINTENANCE]: 'Maintenance',
      [ApplicationStatus.DECOMMISSIONED]: 'Decommissioned'
    };
    return displays[status];
  }
}
TS

cat > "$BASE_FRONTEND/features/applications/application-form/application-form.component.html" << 'HTML'
<div class="container">
  <h1>{{ isEditMode ? 'Edit Application' : 'Create New Application' }}</h1>

  <form [formGroup]="form" (ngSubmit)="onSubmit()">
    <div class="form-group">
      <label for="name">Name *</label>
      <input 
        id="name" 
        type="text" 
        formControlName="name"
        [class.error]="form.get('name')?.invalid && form.get('name')?.touched"
      />
      <div class="error-message" *ngIf="form.get('name')?.invalid && form.get('name')?.touched">
        <span *ngIf="form.get('name')?.errors?.['required']">Name is required</span>
        <span *ngIf="form.get('name')?.errors?.['maxlength']">Name must not exceed 255 characters</span>
      </div>
    </div>

    <div class="form-group">
      <label for="description">Description</label>
      <textarea 
        id="description" 
        formControlName="description"
        rows="4"
      ></textarea>
    </div>

    <div class="form-group">
      <label for="status">Status *</label>
      <select 
        id="status" 
        formControlName="status"
        [class.error]="form.get('status')?.invalid && form.get('status')?.touched"
      >
        <option *ngFor="let status of statusOptions" [value]="status">
          {{ getStatusDisplay(status) }}
        </option>
      </select>
      <div class="error-message" *ngIf="form.get('status')?.invalid && form.get('status')?.touched">
        Status is required
      </div>
    </div>

    <div class="form-group">
      <label for="businessUnitId">Business Unit *</label>
      <select 
        id="businessUnitId" 
        formControlName="businessUnitId"
        [class.error]="form.get('businessUnitId')?.invalid && form.get('businessUnitId')?.touched"
      >
        <option value="">Select a business unit</option>
        <option *ngFor="let bu of businessUnits" [value]="bu.id">
          {{ bu.name }}
        </option>
      </select>
      <div class="error-message" *ngIf="form.get('businessUnitId')?.invalid && form.get('businessUnitId')?.touched">
        Business unit is required
      </div>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label for="endOfSupportDate">End of Support Date</label>
        <input 
          id="endOfSupportDate" 
          type="date" 
          formControlName="endOfSupportDate"
        />
      </div>

      <div class="form-group">
        <label for="endOfLifeDate">End of Life Date</label>
        <input 
          id="endOfLifeDate" 
          type="date" 
          formControlName="endOfLifeDate"
        />
      </div>
    </div>

    <div class="error-message" *ngIf="error">
      {{ error }}
    </div>

    <div class="form-actions">
      <button type="button" (click)="cancel()" class="btn-secondary">Cancel</button>
      <button type="submit" [disabled]="form.invalid || loading" class="btn-primary">
        {{ loading ? 'Saving...' : 'Save' }}
      </button>
    </div>
  </form>
</div>
HTML

cat > "$BASE_FRONTEND/features/applications/application-form/application-form.component.scss" << 'SCSS'
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;

  h1 {
    margin-bottom: 2rem;
  }
}

form {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.form-group {
  margin-bottom: 1.5rem;

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #555;
  }

  input[type="text"],
  input[type="date"],
  select,
  textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
    font-family: inherit;

    &:focus {
      outline: none;
      border-color: #3f51b5;
    }

    &.error {
      border-color: #f44336;
    }
  }
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.btn-primary, .btn-secondary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.btn-primary {
  background-color: #3f51b5;
  color: white;

  &:hover:not(:disabled) {
    background-color: #303f9f;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
}

.btn-secondary {
  background-color: #f5f5f5;
  color: #333;

  &:hover {
    background-color: #e0e0e0;
  }
}

.error-message {
  color: #f44336;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}
SCSS

# ============================================================================
# FRONTEND - Dashboard Component
# ============================================================================

echo "📦 Creating Dashboard component..."

mkdir -p "$BASE_FRONTEND/features/dashboard"

cat > "$BASE_FRONTEND/features/dashboard/dashboard.component.ts" << 'TS'
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  
  cards = [
    {
      title: 'Business Units',
      description: 'Manage organizational units',
      icon: '🏢',
      route: '/business-units',
      color: '#3f51b5'
    },
    {
      title: 'Applications',
      description: 'Manage applications and their lifecycle',
      icon: '📱',
      route: '/applications',
      color: '#f57c00'
    },
    {
      title: 'Environments',
      description: 'Manage deployment environments',
      icon: '🌍',
      route: '/environments',
      color: '#388e3c'
    }
  ];

  constructor(private router: Router) {}

  navigate(route: string): void {
    this.router.navigate([route]);
  }
}
TS

cat > "$BASE_FRONTEND/features/dashboard/dashboard.component.html" << 'HTML'
<div class="dashboard-container">
  <div class="header">
    <h1>LDPv2 Dashboard</h1>
    <p class="subtitle">Lifecycle Data Platform - Application Management</p>
  </div>

  <div class="card-grid">
    <div 
      *ngFor="let card of cards" 
      class="dashboard-card"
      [style.border-left-color]="card.color"
      (click)="navigate(card.route)"
    >
      <div class="card-icon" [style.color]="card.color">{{ card.icon }}</div>
      <div class="card-content">
        <h2>{{ card.title }}</h2>
        <p>{{ card.description }}</p>
      </div>
      <div class="card-arrow">→</div>
    </div>
  </div>
</div>
HTML

cat > "$BASE_FRONTEND/features/dashboard/dashboard.component.scss" << 'SCSS'
.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 2rem;
}

.header {
  margin-bottom: 3rem;
  text-align: center;

  h1 {
    font-size: 2.5rem;
    color: #333;
    margin-bottom: 0.5rem;
  }

  .subtitle {
    font-size: 1.1rem;
    color: #666;
  }
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.dashboard-card {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border-left: 4px solid;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 1.5rem;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }

  .card-icon {
    font-size: 3rem;
    line-height: 1;
  }

  .card-content {
    flex: 1;

    h2 {
      font-size: 1.5rem;
      margin: 0 0 0.5rem 0;
      color: #333;
    }

    p {
      margin: 0;
      color: #666;
      font-size: 0.95rem;
    }
  }

  .card-arrow {
    font-size: 1.5rem;
    color: #999;
    transition: transform 0.3s ease;
  }

  &:hover .card-arrow {
    transform: translateX(4px);
  }
}

@media (max-width: 768px) {
  .card-grid {
    grid-template-columns: 1fr;
  }
  
  .header h1 {
    font-size: 2rem;
  }
}
SCSS

# ============================================================================
# FRONTEND - Update Routes
# ============================================================================

echo "📦 Updating Angular routes..."

cat > "$BASE_FRONTEND/app.routes.ts" << 'TS'
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./core/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'business-units',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/business-units/business-unit-list/business-unit-list.component')
          .then(m => m.BusinessUnitListComponent)
      },
      {
        path: 'new',
        loadComponent: () => import('./features/business-units/business-unit-form/business-unit-form.component')
          .then(m => m.BusinessUnitFormComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./features/business-units/business-unit-detail/business-unit-detail.component')
          .then(m => m.BusinessUnitDetailComponent)
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./features/business-units/business-unit-form/business-unit-form.component')
          .then(m => m.BusinessUnitFormComponent)
      }
    ]
  },
  {
    path: 'applications',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/applications/application-list/application-list.component')
          .then(m => m.ApplicationListComponent)
      },
      {
        path: 'new',
        loadComponent: () => import('./features/applications/application-form/application-form.component')
          .then(m => m.ApplicationFormComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./features/applications/application-detail/application-detail.component')
          .then(m => m.ApplicationDetailComponent)
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./features/applications/application-form/application-form.component')
          .then(m => m.ApplicationFormComponent)
      }
    ]
  },
  {
    path: 'environments',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/environments/environment-list/environment-list.component')
          .then(m => m.EnvironmentListComponent)
      },
      {
        path: 'new',
        loadComponent: () => import('./features/environments/environment-form/environment-form.component')
          .then(m => m.EnvironmentFormComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./features/environments/environment-detail/environment-detail.component')
          .then(m => m.EnvironmentDetailComponent)
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./features/environments/environment-form/environment-form.component')
          .then(m => m.EnvironmentFormComponent)
      }
    ]
  }
];
TS

echo ""
echo "✅ Story 2 (Applications) deployment complete!"
echo ""
echo "📋 Summary:"
echo "  - Database migration created (004-create-application-table.xml)"
echo "  - Backend: ApplicationStatus enum, Application entity, repository, service, controller"
echo "  - Frontend: Application models, service, list/detail/form components"
echo "  - Dashboard component with navigation cards"
echo "  - Routes updated to include dashboard and applications"
echo ""
echo "🚀 Next steps:"
echo "  1. Run from project root: bash deploy-story-2-applications.sh"
echo "  2. Rebuild backend: cd backend && mvn clean package"
echo "  3. Rebuild containers: docker-compose down && docker-compose up --build"
echo "  4. Access at: http://localhost"
echo "  5. Login with admin/admin123"
echo "  6. Navigate to Dashboard to access all features"
echo ""
