package com.retailinventory.service;

import com.retailinventory.dto.warehouse.WarehouseRequest;
import com.retailinventory.dto.warehouse.WarehouseResponse;
import com.retailinventory.entity.Warehouse;
import com.retailinventory.exception.DuplicateResourceException;
import com.retailinventory.exception.ResourceNotFoundException;
import com.retailinventory.repository.WarehouseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class WarehouseService {

    private final WarehouseRepository warehouseRepository;

    public WarehouseService(WarehouseRepository warehouseRepository) {
        this.warehouseRepository = warehouseRepository;
    }

    @Transactional
    public WarehouseResponse createWarehouse(WarehouseRequest request) {
        if (warehouseRepository.existsByCode(request.getCode())) {
            throw new DuplicateResourceException("Warehouse with code " + request.getCode() + " already exists");
        }

        Warehouse warehouse = new Warehouse();
        warehouse.setCode(request.getCode());
        warehouse.setName(request.getName());
        warehouse.setLocation(request.getLocation());
        warehouse.setManager(request.getManager());
        warehouse.setCapacity(request.getCapacity() != null ? request.getCapacity() : 0);
        warehouse.setActive(true);

        Warehouse saved = warehouseRepository.save(warehouse);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<WarehouseResponse> getAllWarehouses(boolean activeOnly) {
        return warehouseRepository.findAll().stream()
                .filter(w -> !activeOnly || w.isActive())
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public WarehouseResponse getWarehouse(Long id) {
        return mapToResponse(getWarehouseEntity(id));
    }
    
    @Transactional(readOnly = true)
    public Warehouse getWarehouseEntity(Long id) {
        return warehouseRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", id));
    }

    @Transactional
    public WarehouseResponse updateWarehouse(Long id, WarehouseRequest request) {
        Warehouse warehouse = getWarehouseEntity(id);

        warehouse.setName(request.getName());
        warehouse.setLocation(request.getLocation());
        warehouse.setManager(request.getManager());
        if (request.getCapacity() != null) {
            warehouse.setCapacity(request.getCapacity());
        }

        Warehouse updated = warehouseRepository.save(warehouse);
        return mapToResponse(updated);
    }

    private WarehouseResponse mapToResponse(Warehouse warehouse) {
        return new WarehouseResponse(
                warehouse.getId(),
                warehouse.getCode(),
                warehouse.getName(),
                warehouse.getLocation(),
                warehouse.getManager(),
                warehouse.getCapacity(),
                warehouse.isActive()
        );
    }
}
