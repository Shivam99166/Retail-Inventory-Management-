package com.retailinventory.service;

import com.retailinventory.dto.stocktransfer.StockTransferRequest;
import com.retailinventory.dto.stocktransfer.StockTransferResponse;
import com.retailinventory.entity.Inventory;
import com.retailinventory.entity.Product;
import com.retailinventory.entity.StockTransaction;
import com.retailinventory.entity.StockTransfer;
import com.retailinventory.entity.StockTransferItem;
import com.retailinventory.entity.Warehouse;
import com.retailinventory.entity.enums.StockTransactionType;
import com.retailinventory.entity.enums.StockTransferStatus;
import com.retailinventory.exception.BusinessException;
import com.retailinventory.exception.ResourceNotFoundException;
import com.retailinventory.repository.InventoryRepository;
import com.retailinventory.repository.StockTransactionRepository;
import com.retailinventory.repository.StockTransferRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class StockTransferService {

    private final StockTransferRepository stockTransferRepository;
    private final WarehouseService warehouseService;
    private final ProductService productService;
    private final InventoryRepository inventoryRepository;
    private final StockTransactionRepository stockTransactionRepository;

    public StockTransferService(StockTransferRepository stockTransferRepository,
                                WarehouseService warehouseService,
                                ProductService productService,
                                InventoryRepository inventoryRepository,
                                StockTransactionRepository stockTransactionRepository) {
        this.stockTransferRepository = stockTransferRepository;
        this.warehouseService = warehouseService;
        this.productService = productService;
        this.inventoryRepository = inventoryRepository;
        this.stockTransactionRepository = stockTransactionRepository;
    }

    @Transactional
    public StockTransferResponse requestTransfer(StockTransferRequest request) {
        if (request.getSourceWarehouseId().equals(request.getDestinationWarehouseId())) {
            throw new BusinessException("Source and destination warehouses cannot be the same");
        }

        Warehouse source = warehouseService.getWarehouseEntity(request.getSourceWarehouseId());
        Warehouse dest = warehouseService.getWarehouseEntity(request.getDestinationWarehouseId());

        StockTransfer transfer = new StockTransfer();
        transfer.setSourceWarehouse(source);
        transfer.setDestinationWarehouse(dest);
        transfer.setRequestDate(LocalDateTime.now());
        transfer.setStatus(StockTransferStatus.REQUESTED);

        request.getItems().forEach(itemDto -> {
            Product product = productService.getProductEntity(itemDto.getProductId());
            
            // Verify source has enough stock
            Inventory sourceInventory = inventoryRepository.findByProductIdAndWarehouseId(product.getId(), source.getId())
                    .orElseThrow(() -> new BusinessException("Product " + product.getSku() + " not found in source warehouse"));
            
            if (sourceInventory.getAvailableStock() < itemDto.getQuantity()) {
                throw new BusinessException("Insufficient stock for product " + product.getSku() + " in source warehouse");
            }

            StockTransferItem item = new StockTransferItem();
            item.setProduct(product);
            item.setQuantity(itemDto.getQuantity());
            transfer.addItem(item);
        });

        StockTransfer saved = stockTransferRepository.save(transfer);
        return mapToResponse(saved);
    }

    @Transactional
    public StockTransferResponse approveTransfer(Long transferId) {
        StockTransfer transfer = getTransferEntity(transferId);
        
        if (transfer.getStatus() != StockTransferStatus.REQUESTED) {
            throw new BusinessException("Only requested transfers can be approved");
        }

        // Process stock movement
        transfer.getItems().forEach(item -> {
            // Deduct from source
            Inventory sourceInv = inventoryRepository.findByProductIdAndWarehouseId(
                    item.getProduct().getId(), transfer.getSourceWarehouse().getId()
            ).orElseThrow(() -> new BusinessException("Source inventory missing"));
            
            if (sourceInv.getAvailableStock() < item.getQuantity()) {
                throw new BusinessException("Insufficient stock for " + item.getProduct().getSku());
            }
            sourceInv.setAvailableStock(sourceInv.getAvailableStock() - item.getQuantity());
            inventoryRepository.save(sourceInv);

            // Log source transaction
            StockTransaction sourceTx = new StockTransaction();
            sourceTx.setProduct(item.getProduct());
            sourceTx.setWarehouse(transfer.getSourceWarehouse());
            sourceTx.setQuantity(-item.getQuantity());
            sourceTx.setType(StockTransactionType.TRANSFER);
            sourceTx.setReference("TRF-" + transfer.getId());
            sourceTx.setTransactionDate(LocalDateTime.now());
            stockTransactionRepository.save(sourceTx);

            // Add to destination
            Inventory destInv = inventoryRepository.findByProductIdAndWarehouseId(
                    item.getProduct().getId(), transfer.getDestinationWarehouse().getId()
            ).orElseGet(() -> {
                Inventory newInv = new Inventory();
                newInv.setProduct(item.getProduct());
                newInv.setWarehouse(transfer.getDestinationWarehouse());
                newInv.setAvailableStock(0);
                return newInv;
            });
            destInv.setAvailableStock(destInv.getAvailableStock() + item.getQuantity());
            inventoryRepository.save(destInv);

            // Log destination transaction
            StockTransaction destTx = new StockTransaction();
            destTx.setProduct(item.getProduct());
            destTx.setWarehouse(transfer.getDestinationWarehouse());
            destTx.setQuantity(item.getQuantity());
            destTx.setType(StockTransactionType.TRANSFER);
            destTx.setReference("TRF-" + transfer.getId());
            destTx.setTransactionDate(LocalDateTime.now());
            stockTransactionRepository.save(destTx);
        });

        transfer.setStatus(StockTransferStatus.APPROVED);
        return mapToResponse(stockTransferRepository.save(transfer));
    }

    @Transactional
    public StockTransferResponse completeTransfer(Long transferId) {
        StockTransfer transfer = getTransferEntity(transferId);
        if (transfer.getStatus() != StockTransferStatus.APPROVED) {
            throw new BusinessException("Only approved transfers can be completed");
        }
        transfer.setStatus(StockTransferStatus.COMPLETED);
        return mapToResponse(stockTransferRepository.save(transfer));
    }
    
    @Transactional
    public StockTransferResponse cancelTransfer(Long transferId) {
        StockTransfer transfer = getTransferEntity(transferId);
        if (transfer.getStatus() != StockTransferStatus.REQUESTED) {
            throw new BusinessException("Only requested transfers can be cancelled");
        }
        transfer.setStatus(StockTransferStatus.CANCELLED);
        return mapToResponse(stockTransferRepository.save(transfer));
    }

    @Transactional(readOnly = true)
    public List<StockTransferResponse> getAllTransfers() {
        return stockTransferRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public StockTransfer getTransferEntity(Long id) {
        return stockTransferRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new ResourceNotFoundException("Stock Transfer", id));
    }

    private StockTransferResponse mapToResponse(StockTransfer transfer) {
        List<StockTransferResponse.StockTransferItemResponse> items = transfer.getItems().stream()
                .map(item -> new StockTransferResponse.StockTransferItemResponse(
                        item.getProduct().getId(),
                        item.getProduct().getName(),
                        item.getProduct().getSku(),
                        item.getQuantity()
                )).collect(Collectors.toList());

        return new StockTransferResponse(
                transfer.getId(),
                transfer.getSourceWarehouse().getId(),
                transfer.getSourceWarehouse().getName(),
                transfer.getDestinationWarehouse().getId(),
                transfer.getDestinationWarehouse().getName(),
                transfer.getRequestDate(),
                transfer.getStatus().name(),
                items
        );
    }
}
