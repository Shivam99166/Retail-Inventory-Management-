package com.retailinventory.service;

import com.retailinventory.dto.report.DashboardReportResponse;
import com.retailinventory.dto.report.TransactionLogResponse;
import com.retailinventory.entity.StockTransaction;
import com.retailinventory.entity.enums.OrderStatus;
import com.retailinventory.entity.enums.StockTransferStatus;
import com.retailinventory.repository.InventoryRepository;
import com.retailinventory.repository.OrderRepository;
import com.retailinventory.repository.ProductRepository;
import com.retailinventory.repository.StockTransactionRepository;
import com.retailinventory.repository.StockTransferRepository;
import com.retailinventory.repository.WarehouseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final StockTransactionRepository transactionRepository;
    private final ProductRepository productRepository;
    private final WarehouseRepository warehouseRepository;
    private final InventoryRepository inventoryRepository;
    private final OrderRepository orderRepository;
    private final StockTransferRepository transferRepository;

    public ReportService(StockTransactionRepository transactionRepository,
                         ProductRepository productRepository,
                         WarehouseRepository warehouseRepository,
                         InventoryRepository inventoryRepository,
                         OrderRepository orderRepository,
                         StockTransferRepository transferRepository) {
        this.transactionRepository = transactionRepository;
        this.productRepository = productRepository;
        this.warehouseRepository = warehouseRepository;
        this.inventoryRepository = inventoryRepository;
        this.orderRepository = orderRepository;
        this.transferRepository = transferRepository;
    }

    @Transactional(readOnly = true)
    public DashboardReportResponse getDashboardSummary() {
        long totalProducts = productRepository.count();
        long totalWarehouses = warehouseRepository.count();
        
        long lowStock = inventoryRepository.findAll().stream()
                .filter(inv -> inv.getAvailableStock() > 0 && inv.getAvailableStock() <= inv.getProduct().getReorderLevel())
                .count();
                
        long outOfStock = inventoryRepository.findAll().stream()
                .filter(inv -> inv.getAvailableStock() <= 0)
                .count();

        long pendingOrders = orderRepository.findAll().stream()
                .filter(o -> o.getStatus() == OrderStatus.PENDING)
                .count();

        long pendingTransfers = transferRepository.findAll().stream()
                .filter(t -> t.getStatus() == StockTransferStatus.REQUESTED)
                .count();

        // Calculate revenue from CONFIRMED, PROCESSING, SHIPPED, DELIVERED orders
        BigDecimal totalRevenue = orderRepository.findAll().stream()
                .filter(o -> o.getStatus() != OrderStatus.PENDING && o.getStatus() != OrderStatus.CANCELLED)
                .map(o -> o.getTotalAmount())
                .reduce(BigDecimal.ZERO, (a, b) -> a.add(b));

        return new DashboardReportResponse(
                totalProducts,
                totalWarehouses,
                lowStock,
                outOfStock,
                pendingOrders,
                pendingTransfers,
                totalRevenue
        );
    }

    @Transactional(readOnly = true)
    public List<TransactionLogResponse> getAllTransactions() {
        return transactionRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private TransactionLogResponse mapToResponse(StockTransaction tx) {
        return new TransactionLogResponse(
                tx.getId(),
                tx.getProduct().getId(),
                tx.getProduct().getName(),
                tx.getProduct().getSku(),
                tx.getWarehouse().getId(),
                tx.getWarehouse().getName(),
                tx.getQuantity(),
                tx.getType().name(),
                tx.getReference(),
                tx.getTransactionDate()
        );
    }
}
