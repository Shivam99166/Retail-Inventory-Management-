package com.retailinventory.service;

import com.retailinventory.dto.purchaseorder.PurchaseOrderRequest;
import com.retailinventory.dto.purchaseorder.PurchaseOrderResponse;
import com.retailinventory.entity.Inventory;
import com.retailinventory.entity.Product;
import com.retailinventory.entity.PurchaseOrder;
import com.retailinventory.entity.PurchaseOrderItem;
import com.retailinventory.entity.StockTransaction;
import com.retailinventory.entity.Supplier;
import com.retailinventory.entity.Warehouse;
import com.retailinventory.entity.enums.PurchaseOrderStatus;
import com.retailinventory.entity.enums.StockTransactionType;
import com.retailinventory.exception.BusinessException;
import com.retailinventory.exception.ResourceNotFoundException;
import com.retailinventory.repository.InventoryRepository;
import com.retailinventory.repository.PurchaseOrderRepository;
import com.retailinventory.repository.StockTransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class PurchaseOrderService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final SupplierService supplierService;
    private final WarehouseService warehouseService;
    private final ProductService productService;
    private final InventoryRepository inventoryRepository;
    private final StockTransactionRepository stockTransactionRepository;

    public PurchaseOrderService(PurchaseOrderRepository purchaseOrderRepository,
                                SupplierService supplierService,
                                WarehouseService warehouseService,
                                ProductService productService,
                                InventoryRepository inventoryRepository,
                                StockTransactionRepository stockTransactionRepository) {
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.supplierService = supplierService;
        this.warehouseService = warehouseService;
        this.productService = productService;
        this.inventoryRepository = inventoryRepository;
        this.stockTransactionRepository = stockTransactionRepository;
    }

    @Transactional
    public PurchaseOrderResponse createPurchaseOrder(PurchaseOrderRequest request) {
        Supplier supplier = supplierService.getSupplierEntity(request.getSupplierId());
        Warehouse warehouse = warehouseService.getWarehouseEntity(request.getWarehouseId());

        PurchaseOrder po = new PurchaseOrder();
        po.setSupplier(supplier);
        po.setDestinationWarehouse(warehouse);
        po.setOrderDate(LocalDateTime.now());
        po.setExpectedDelivery(request.getExpectedDelivery());
        po.setStatus(PurchaseOrderStatus.DRAFT);
        
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (var itemReq : request.getItems()) {
            Product product = productService.getProductEntity(itemReq.getProductId());
            PurchaseOrderItem item = new PurchaseOrderItem();
            item.setProduct(product);
            item.setQuantity(itemReq.getQuantity());
            item.setUnitPrice(itemReq.getUnitPrice());
            po.addItem(item);
            
            BigDecimal itemTotal = itemReq.getUnitPrice().multiply(new BigDecimal(itemReq.getQuantity()));
            totalAmount = totalAmount.add(itemTotal);
        }

        po.setTotalAmount(totalAmount);
        return mapToResponse(purchaseOrderRepository.save(po));
    }

    @Transactional
    public PurchaseOrderResponse submitOrder(Long id) {
        PurchaseOrder po = getPurchaseOrderEntity(id);
        if (po.getStatus() != PurchaseOrderStatus.DRAFT) {
            throw new BusinessException("Only DRAFT purchase orders can be submitted");
        }
        po.setStatus(PurchaseOrderStatus.SUBMITTED);
        return mapToResponse(purchaseOrderRepository.save(po));
    }

    @Transactional
    public PurchaseOrderResponse approveOrder(Long id) {
        PurchaseOrder po = getPurchaseOrderEntity(id);
        if (po.getStatus() != PurchaseOrderStatus.SUBMITTED) {
            throw new BusinessException("Only SUBMITTED purchase orders can be approved");
        }
        po.setStatus(PurchaseOrderStatus.APPROVED);
        return mapToResponse(purchaseOrderRepository.save(po));
    }

    @Transactional
    public PurchaseOrderResponse receiveOrder(Long id) {
        PurchaseOrder po = getPurchaseOrderEntity(id);
        
        if (po.getStatus() != PurchaseOrderStatus.APPROVED) {
            throw new BusinessException("Only APPROVED purchase orders can be received to add stock");
        }

        // Add stock to warehouse
        Warehouse destWarehouse = po.getDestinationWarehouse();
        
        for (PurchaseOrderItem item : po.getItems()) {
            Inventory inv = inventoryRepository.findByProductIdAndWarehouseId(item.getProduct().getId(), destWarehouse.getId())
                    .orElseGet(() -> {
                        Inventory newInv = new Inventory();
                        newInv.setProduct(item.getProduct());
                        newInv.setWarehouse(destWarehouse);
                        newInv.setAvailableStock(0);
                        return newInv;
                    });
            
            inv.setAvailableStock(inv.getAvailableStock() + item.getQuantity());
            inventoryRepository.save(inv);

            // Log Transaction
            StockTransaction tx = new StockTransaction();
            tx.setProduct(item.getProduct());
            tx.setWarehouse(destWarehouse);
            tx.setQuantity(item.getQuantity());
            tx.setType(StockTransactionType.PURCHASE);
            tx.setReference("PO-" + po.getId());
            tx.setTransactionDate(LocalDateTime.now());
            stockTransactionRepository.save(tx);
        }

        po.setStatus(PurchaseOrderStatus.RECEIVED);
        return mapToResponse(purchaseOrderRepository.save(po));
    }

    @Transactional
    public PurchaseOrderResponse cancelOrder(Long id) {
        PurchaseOrder po = getPurchaseOrderEntity(id);
        if (po.getStatus() == PurchaseOrderStatus.RECEIVED) {
            throw new BusinessException("Cannot cancel a PO that has already been received (stock already added)");
        }
        po.setStatus(PurchaseOrderStatus.CANCELLED);
        return mapToResponse(purchaseOrderRepository.save(po));
    }

    @Transactional(readOnly = true)
    public List<PurchaseOrderResponse> getAllPurchaseOrders() {
        return purchaseOrderRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public PurchaseOrderResponse getPurchaseOrder(Long id) {
        return mapToResponse(getPurchaseOrderEntity(id));
    }

    @Transactional(readOnly = true)
    public PurchaseOrder getPurchaseOrderEntity(Long id) {
        return purchaseOrderRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new ResourceNotFoundException("Purchase Order", id));
    }

    private PurchaseOrderResponse mapToResponse(PurchaseOrder po) {
        List<PurchaseOrderResponse.PurchaseOrderItemResponse> items = po.getItems().stream()
                .map(item -> new PurchaseOrderResponse.PurchaseOrderItemResponse(
                        item.getProduct().getId(),
                        item.getProduct().getName(),
                        item.getProduct().getSku(),
                        item.getQuantity(),
                        item.getUnitPrice()
                )).collect(Collectors.toList());

        return new PurchaseOrderResponse(
                po.getId(),
                po.getSupplier().getName(),
                po.getSupplier().getId(),
                po.getDestinationWarehouse().getId(),
                po.getDestinationWarehouse().getName(),
                po.getOrderDate(),
                po.getExpectedDelivery(),
                po.getTotalAmount(),
                po.getStatus().name(),
                items
        );
    }
}
