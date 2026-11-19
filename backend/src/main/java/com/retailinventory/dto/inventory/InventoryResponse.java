package com.retailinventory.dto.inventory;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class InventoryResponse {
    private Long id;
    private Long productId;
    private String productName;
    private String sku;
    private Long warehouseId;
    private String warehouseName;
    private Integer availableStock;
    private Integer reorderLevel;
    private String stockStatus; // IN_STOCK, LOW_STOCK, OUT_OF_STOCK

    public InventoryResponse(Long id, Long productId, String productName, String sku, Long warehouseId,
                             String warehouseName, Integer availableStock, Integer reorderLevel, String stockStatus) {
        this.id = id;
        this.productId = productId;
        this.productName = productName;
        this.sku = sku;
        this.warehouseId = warehouseId;
        this.warehouseName = warehouseName;
        this.availableStock = availableStock;
        this.reorderLevel = reorderLevel;
        this.stockStatus = stockStatus;
    }
}
