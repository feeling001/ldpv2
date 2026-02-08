package com.ldpv2.service;

import com.ldpv2.domain.entity.Contact;
import com.ldpv2.domain.entity.ContactPerson;
import com.ldpv2.domain.entity.ContactRole;
import com.ldpv2.domain.entity.Person;
import com.ldpv2.dto.request.CreateContactRequest;
import com.ldpv2.dto.response.ContactResponse;
import com.ldpv2.dto.response.ContactRoleResponse;
import com.ldpv2.dto.response.PersonInContactResponse;
import com.ldpv2.dto.response.PersonResponse;
import com.ldpv2.exception.BadRequestException;
import com.ldpv2.exception.ResourceNotFoundException;
import com.ldpv2.repository.ContactRepository;
import com.ldpv2.repository.ContactRoleRepository;
import com.ldpv2.repository.PersonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ContactService {

    @Autowired
    private ContactRepository contactRepository;

    @Autowired
    private ContactRoleRepository contactRoleRepository;

    @Autowired
    private PersonRepository personRepository;

    @Transactional
    public ContactResponse create(CreateContactRequest request) {
        ContactRole role = contactRoleRepository.findById(request.getContactRoleId())
                .orElseThrow(() -> new ResourceNotFoundException(
                    "Contact role not found with id: " + request.getContactRoleId()));

        if (!request.getPersonIds().contains(request.getPrimaryPersonId())) {
            throw new BadRequestException("Primary person must be in the list of persons");
        }

        Contact contact = new Contact();
        contact.setContactRole(role);

        for (UUID personId : request.getPersonIds()) {
            Person person = personRepository.findById(personId)
                    .orElseThrow(() -> new ResourceNotFoundException("Person not found with id: " + personId));
            boolean isPrimary = personId.equals(request.getPrimaryPersonId());
            contact.addPerson(person, isPrimary);
        }

        contact = contactRepository.save(contact);
        return mapToResponse(contact);
    }

    public ContactResponse findById(UUID id) {
        Contact contact = contactRepository.findByIdWithDetails(id);
        if (contact == null) {
            throw new ResourceNotFoundException("Contact not found with id: " + id);
        }
        return mapToResponse(contact);
    }

    public List<ContactResponse> findAll() {
        return contactRepository.findAllWithDetails().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ContactResponse addPerson(UUID contactId, UUID personId, boolean isPrimary) {
        Contact contact = contactRepository.findById(contactId)
                .orElseThrow(() -> new ResourceNotFoundException("Contact not found with id: " + contactId));

        Person person = personRepository.findById(personId)
                .orElseThrow(() -> new ResourceNotFoundException("Person not found with id: " + personId));

        contact.addPerson(person, isPrimary);
        contact = contactRepository.save(contact);
        return mapToResponse(contact);
    }

    @Transactional
    public ContactResponse removePerson(UUID contactId, UUID personId) {
        Contact contact = contactRepository.findById(contactId)
                .orElseThrow(() -> new ResourceNotFoundException("Contact not found with id: " + contactId));

        Person person = personRepository.findById(personId)
                .orElseThrow(() -> new ResourceNotFoundException("Person not found with id: " + personId));

        contact.removePerson(person);
        contact = contactRepository.save(contact);
        return mapToResponse(contact);
    }

    @Transactional
    public ContactResponse setPrimary(UUID contactId, UUID personId) {
        Contact contact = contactRepository.findByIdWithDetails(contactId);
        if (contact == null) {
            throw new ResourceNotFoundException("Contact not found with id: " + contactId);
        }

        boolean personFound = false;
        for (ContactPerson cp : contact.getContactPersons()) {
            if (cp.getPerson().getId().equals(personId)) {
                cp.setPrimary(true);
                personFound = true;
            } else {
                cp.setPrimary(false);
            }
        }

        if (!personFound) {
            throw new ResourceNotFoundException("Person not found in contact");
        }

        contact = contactRepository.save(contact);
        return mapToResponse(contact);
    }

    @Transactional
    public void delete(UUID id) {
        if (!contactRepository.existsById(id)) {
            throw new ResourceNotFoundException("Contact not found with id: " + id);
        }
        contactRepository.deleteById(id);
    }

    private ContactResponse mapToResponse(Contact contact) {
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
