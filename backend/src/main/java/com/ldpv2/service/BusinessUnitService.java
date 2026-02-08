package com.ldpv2.service;

import com.ldpv2.domain.entity.BusinessUnit;
import com.ldpv2.dto.request.CreateBusinessUnitRequest;
import com.ldpv2.dto.request.UpdateBusinessUnitRequest;
import com.ldpv2.dto.response.BusinessUnitResponse;
import com.ldpv2.exception.BadRequestException;
import com.ldpv2.exception.ResourceNotFoundException;
import com.ldpv2.repository.BusinessUnitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class BusinessUnitService {

    @Autowired
    private BusinessUnitRepository businessUnitRepository;

    @Transactional
    public BusinessUnitResponse create(CreateBusinessUnitRequest request) {
        // Check if name already exists
        if (businessUnitRepository.existsByName(request.getName())) {
            throw new BadRequestException("Business unit with name '" + request.getName() + "' already exists");
        }

        BusinessUnit businessUnit = new BusinessUnit();
        businessUnit.setName(request.getName());
        businessUnit.setDescription(request.getDescription());

        businessUnit = businessUnitRepository.save(businessUnit);
        return mapToResponse(businessUnit);
    }

    @Transactional
    public BusinessUnitResponse update(UUID id, UpdateBusinessUnitRequest request) {
        BusinessUnit businessUnit = businessUnitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Business unit not found with id: " + id));

        // Check if new name already exists (excluding current business unit)
        if (request.getName() != null && !request.getName().equals(businessUnit.getName())) {
            if (businessUnitRepository.existsByName(request.getName())) {
                throw new BadRequestException("Business unit with name '" + request.getName() + "' already exists");
            }
            businessUnit.setName(request.getName());
        }

        if (request.getDescription() != null) {
            businessUnit.setDescription(request.getDescription());
        }

        businessUnit = businessUnitRepository.save(businessUnit);
        return mapToResponse(businessUnit);
    }

    public BusinessUnitResponse findById(UUID id) {
        BusinessUnit businessUnit = businessUnitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Business unit not found with id: " + id));
        return mapToResponse(businessUnit);
    }

    public Page<BusinessUnitResponse> findAll(Pageable pageable) {
        return businessUnitRepository.findAll(pageable).map(this::mapToResponse);
    }

    public Page<BusinessUnitResponse> search(String query, Pageable pageable) {
        return businessUnitRepository.findByNameContainingIgnoreCase(query, pageable)
                .map(this::mapToResponse);
    }

    @Transactional
    public void delete(UUID id) {
        if (!businessUnitRepository.existsById(id)) {
            throw new ResourceNotFoundException("Business unit not found with id: " + id);
        }
        businessUnitRepository.deleteById(id);
    }

    private BusinessUnitResponse mapToResponse(BusinessUnit businessUnit) {
        return new BusinessUnitResponse(
            businessUnit.getId(),
            businessUnit.getName(),
            businessUnit.getDescription(),
            businessUnit.getCreatedAt(),
            businessUnit.getUpdatedAt()
        );
    }
}
