package com.retailinventory.dto.report;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class TransactionLogResponse {
    private Long id;
    private Long productId;
    private String productName;
    private String sku;
    private Long warehouseId;
    private String warehouseName;
    private Integer quantity;
    private String type;
    private String reference;
    private LocalDateTime transactionDate;

    public TransactionLogResponse(Long id, Long productId, String productName, String sku, Long warehouseId,
                                  String warehouseName, Integer quantity, String type, String reference,
                                  LocalDateTime transactionDate) {
        this.id = id;
        this.productId = productId;
        this.productName = productName;
        this.sku = sku;
        this.warehouseId = warehouseId;
        this.warehouseName = warehouseName;
        this.quantity = quantity;
        this.type = type;
        this.reference = reference;
        this.transactionDate = transactionDate;
    }
}
