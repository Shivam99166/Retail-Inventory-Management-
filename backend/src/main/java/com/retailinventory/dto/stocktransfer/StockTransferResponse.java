package com.retailinventory.dto.stocktransfer;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class StockTransferResponse {
    private Long id;
    private Long sourceWarehouseId;
    private String sourceWarehouseName;
    private Long destinationWarehouseId;
    private String destinationWarehouseName;
    private LocalDateTime requestDate;
    private String status;
    private List<StockTransferItemResponse> items;

    public StockTransferResponse(Long id, Long sourceWarehouseId, String sourceWarehouseName,
                                 Long destinationWarehouseId, String destinationWarehouseName,
                                 LocalDateTime requestDate, String status, List<StockTransferItemResponse> items) {
        this.id = id;
        this.sourceWarehouseId = sourceWarehouseId;
        this.sourceWarehouseName = sourceWarehouseName;
        this.destinationWarehouseId = destinationWarehouseId;
        this.destinationWarehouseName = destinationWarehouseName;
        this.requestDate = requestDate;
        this.status = status;
        this.items = items;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class StockTransferItemResponse {
        private Long productId;
        private String productName;
        private String sku;
        private Integer quantity;

        public StockTransferItemResponse(Long productId, String productName, String sku, Integer quantity) {
            this.productId = productId;
            this.productName = productName;
            this.sku = sku;
            this.quantity = quantity;
        }
    }
}
