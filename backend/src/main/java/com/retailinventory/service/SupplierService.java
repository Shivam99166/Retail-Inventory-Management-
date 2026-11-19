package com.retailinventory.service;

import com.retailinventory.dto.supplier.SupplierRequest;
import com.retailinventory.dto.supplier.SupplierResponse;
import com.retailinventory.entity.Supplier;
import com.retailinventory.exception.ResourceNotFoundException;
import com.retailinventory.repository.SupplierRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class SupplierService {

    private final SupplierRepository supplierRepository;

    public SupplierService(SupplierRepository supplierRepository) {
        this.supplierRepository = supplierRepository;
    }

    @Transactional
    public SupplierResponse createSupplier(SupplierRequest request) {
        Supplier supplier = new Supplier();
        supplier.setName(request.getName());
        supplier.setContactPerson(request.getContactPerson());
        supplier.setEmail(request.getEmail());
        supplier.setPhone(request.getPhone());
        supplier.setLeadTime(request.getLeadTime() != null ? request.getLeadTime() : 0);
        supplier.setActive(true);

        return mapToResponse(supplierRepository.save(supplier));
    }

    @Transactional(readOnly = true)
    public List<SupplierResponse> getAllSuppliers(boolean activeOnly) {
        return supplierRepository.findAll().stream()
                .filter(s -> !activeOnly || s.isActive())
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SupplierResponse getSupplier(Long id) {
        return mapToResponse(getSupplierEntity(id));
    }

    @Transactional(readOnly = true)
    public Supplier getSupplierEntity(Long id) {
        return supplierRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", id));
    }

    @Transactional
    public SupplierResponse updateSupplier(Long id, SupplierRequest request) {
        Supplier supplier = getSupplierEntity(id);

        supplier.setName(request.getName());
        supplier.setContactPerson(request.getContactPerson());
        supplier.setEmail(request.getEmail());
        supplier.setPhone(request.getPhone());
        if (request.getLeadTime() != null) {
            supplier.setLeadTime(request.getLeadTime());
        }

        return mapToResponse(supplierRepository.save(supplier));
    }

    private SupplierResponse mapToResponse(Supplier supplier) {
        return new SupplierResponse(
                supplier.getId(),
                supplier.getName(),
                supplier.getContactPerson(),
                supplier.getEmail(),
                supplier.getPhone(),
                supplier.getLeadTime(),
                supplier.isActive()
        );
    }
}
