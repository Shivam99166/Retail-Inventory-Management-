package com.retailinventory.dto.purchaseorder;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class PurchaseOrderResponse {
    private Long id;
    private String supplierName;
    private Long supplierId;
    private Long warehouseId;
    private String warehouseName;
    private LocalDateTime orderDate;
    private LocalDateTime expectedDelivery;
    private BigDecimal totalAmount;
    private String status;
    private List<PurchaseOrderItemResponse> items;

    public PurchaseOrderResponse(Long id, String supplierName, Long supplierId, Long warehouseId,
                                 String warehouseName, LocalDateTime orderDate, LocalDateTime expectedDelivery,
                                 BigDecimal totalAmount, String status, List<PurchaseOrderItemResponse> items) {
        this.id = id;
        this.supplierName = supplierName;
        this.supplierId = supplierId;
        this.warehouseId = warehouseId;
        this.warehouseName = warehouseName;
        this.orderDate = orderDate;
        this.expectedDelivery = expectedDelivery;
        this.totalAmount = totalAmount;
        this.status = status;
        this.items = items;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class PurchaseOrderItemResponse {
        private Long productId;
        private String productName;
        private String sku;
        private Integer quantity;
        private BigDecimal unitPrice;

        public PurchaseOrderItemResponse(Long productId, String productName, String sku, Integer quantity, BigDecimal unitPrice) {
            this.productId = productId;
            this.productName = productName;
            this.sku = sku;
            this.quantity = quantity;
            this.unitPrice = unitPrice;
        }
    }
}
