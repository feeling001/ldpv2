package com.ldpv2.service;

import com.ldpv2.domain.entity.Person;
import com.ldpv2.dto.request.CreatePersonRequest;
import com.ldpv2.dto.request.UpdatePersonRequest;
import com.ldpv2.dto.response.PersonResponse;
import com.ldpv2.exception.BadRequestException;
import com.ldpv2.exception.ResourceNotFoundException;
import com.ldpv2.repository.PersonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class PersonService {

    @Autowired
    private PersonRepository personRepository;

    @Transactional
    public PersonResponse create(CreatePersonRequest request) {
        if (personRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Person with email '" + request.getEmail() + "' already exists");
        }

        Person person = new Person();
        person.setFirstName(request.getFirstName());
        person.setLastName(request.getLastName());
        person.setEmail(request.getEmail());
        person.setPhone(request.getPhone());

        person = personRepository.save(person);
        return mapToResponse(person);
    }

    @Transactional
    public PersonResponse update(UUID id, UpdatePersonRequest request) {
        Person person = personRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Person not found with id: " + id));

        if (request.getFirstName() != null) {
            person.setFirstName(request.getFirstName());
        }

        if (request.getLastName() != null) {
            person.setLastName(request.getLastName());
        }

        if (request.getEmail() != null) {
            if (!request.getEmail().equals(person.getEmail()) && 
                personRepository.existsByEmail(request.getEmail())) {
                throw new BadRequestException("Person with email '" + request.getEmail() + "' already exists");
            }
            person.setEmail(request.getEmail());
        }

        if (request.getPhone() != null) {
            person.setPhone(request.getPhone());
        }

        person = personRepository.save(person);
        return mapToResponse(person);
    }

    public PersonResponse findById(UUID id) {
        Person person = personRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Person not found with id: " + id));
        return mapToResponse(person);
    }

    public Page<PersonResponse> findAll(Pageable pageable) {
        return personRepository.findAll(pageable).map(this::mapToResponse);
    }

    public Page<PersonResponse> search(String name, Pageable pageable) {
        return personRepository.findByName(name, pageable).map(this::mapToResponse);
    }

    @Transactional
    public void delete(UUID id) {
        if (!personRepository.existsById(id)) {
            throw new ResourceNotFoundException("Person not found with id: " + id);
        }
        personRepository.deleteById(id);
    }

    private PersonResponse mapToResponse(Person person) {
        return new PersonResponse(
            person.getId(),
            person.getFirstName(),
            person.getLastName(),
            person.getEmail(),
            person.getPhone(),
            person.getCreatedAt(),
            person.getUpdatedAt()
        );
    }
}
