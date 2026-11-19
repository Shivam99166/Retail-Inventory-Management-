package com.retailinventory.service;

import com.retailinventory.dto.inventory.InventoryResponse;
import com.retailinventory.entity.Inventory;
import com.retailinventory.repository.InventoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class InventoryService {

    private final InventoryRepository inventoryRepository;

    public InventoryService(InventoryRepository inventoryRepository) {
        this.inventoryRepository = inventoryRepository;
    }

    @Transactional(readOnly = true)
    public List<InventoryResponse> getAllInventory() {
        return inventoryRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<InventoryResponse> getLowStockInventory() {
        return inventoryRepository.findAll().stream()
                .filter(inv -> inv.getAvailableStock() > 0 && inv.getAvailableStock() <= inv.getProduct().getReorderLevel())
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<InventoryResponse> getOutStockInventory() {
        return inventoryRepository.findAll().stream()
                .filter(inv -> inv.getAvailableStock() <= 0)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private InventoryResponse mapToResponse(Inventory inventory) {
        String status = "IN_STOCK";
        int stock = inventory.getAvailableStock();
        int reorder = inventory.getProduct().getReorderLevel();
        
        if (stock <= 0) {
            status = "OUT_OF_STOCK";
        } else if (stock <= reorder) {
            status = "LOW_STOCK";
        }

        return new InventoryResponse(
                inventory.getId(),
                inventory.getProduct().getId(),
                inventory.getProduct().getName(),
                inventory.getProduct().getSku(),
                inventory.getWarehouse().getId(),
                inventory.getWarehouse().getName(),
                stock,
                reorder,
                status
        );
    }
}
