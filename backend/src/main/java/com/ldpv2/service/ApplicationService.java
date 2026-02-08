package com.ldpv2.service;

import com.ldpv2.domain.entity.Application;
import com.ldpv2.domain.entity.ApplicationContact;
import com.ldpv2.domain.entity.BusinessUnit;
import com.ldpv2.domain.entity.Contact;
import com.ldpv2.domain.enums.ApplicationStatus;
import com.ldpv2.dto.request.CreateApplicationRequest;
import com.ldpv2.dto.request.UpdateApplicationRequest;
import com.ldpv2.dto.response.*;
import com.ldpv2.exception.BadRequestException;
import com.ldpv2.exception.ResourceNotFoundException;
import com.ldpv2.repository.ApplicationContactRepository;
import com.ldpv2.repository.ApplicationRepository;
import com.ldpv2.repository.BusinessUnitRepository;
import com.ldpv2.repository.ContactRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ApplicationService {

    @Autowired
    private ApplicationRepository applicationRepository;
    
    @Autowired
    private BusinessUnitRepository businessUnitRepository;

    @Autowired
    private ContactRepository contactRepository;

    @Autowired
    private ApplicationContactRepository applicationContactRepository;

    @Transactional
    public ApplicationResponse create(CreateApplicationRequest request) {
        BusinessUnit businessUnit = businessUnitRepository.findById(request.getBusinessUnitId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Business unit not found with id: " + request.getBusinessUnitId()));
        
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

    @Transactional
    public ApplicationContactResponse addContact(UUID applicationId, UUID contactId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Application not found with id: " + applicationId));

        Contact contact = contactRepository.findById(contactId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Contact not found with id: " + contactId));

        application.addContact(contact);
        applicationRepository.save(application);

        return new ApplicationContactResponse(applicationId, mapContactToResponse(contact));
    }

    @Transactional
    public void removeContact(UUID applicationId, UUID contactId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Application not found with id: " + applicationId));

        Contact contact = contactRepository.findById(contactId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Contact not found with id: " + contactId));

        application.removeContact(contact);
        applicationRepository.save(application);
    }

    public List<ApplicationContactResponse> getApplicationContacts(UUID applicationId) {
        if (!applicationRepository.existsById(applicationId)) {
            throw new ResourceNotFoundException("Application not found with id: " + applicationId);
        }

        List<ApplicationContact> appContacts = applicationContactRepository
                .findByApplicationIdWithDetails(applicationId);

        return appContacts.stream()
                .map(ac -> new ApplicationContactResponse(
                        applicationId,
                        mapContactToResponse(ac.getContact())
                ))
                .collect(Collectors.toList());
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

    private ContactResponse mapContactToResponse(Contact contact) {
        ContactRoleResponse roleResponse = new ContactRoleResponse(
                contact.getContactRole().getId(),
                contact.getContactRole().getRoleName(),
                contact.getContactRole().getDescription(),
                contact.getContactRole().getCreatedAt(),
                contact.getContactRole().getUpdatedAt()
        );

        List<PersonInContactResponse> personsResponse = contact.getContactPersons().stream()
                .map(cp -> {
                    PersonResponse personResponse = new PersonResponse(
                            cp.getPerson().getId(),
                            cp.getPerson().getFirstName(),
                            cp.getPerson().getLastName(),
                            cp.getPerson().getEmail(),
                            cp.getPerson().getPhone(),
                            cp.getPerson().getCreatedAt(),
                            cp.getPerson().getUpdatedAt()
                    );
                    return new PersonInContactResponse(personResponse, cp.isPrimary());
                })
                .collect(Collectors.toList());

        return new ContactResponse(
                contact.getId(),
                roleResponse,
                personsResponse,
                contact.getCreatedAt(),
                contact.getUpdatedAt()
        );
    }
}
