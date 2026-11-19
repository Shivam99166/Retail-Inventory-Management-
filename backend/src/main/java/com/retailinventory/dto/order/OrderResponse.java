package com.retailinventory.dto.order;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class OrderResponse {
    private Long id;
    private String customerName;
    private String customerEmail;
    private LocalDateTime orderDate;
    private String status;
    private BigDecimal totalAmount;
    private List<OrderItemResponse> items;

    public OrderResponse(Long id, String customerName, String customerEmail, LocalDateTime orderDate,
                         String status, BigDecimal totalAmount, List<OrderItemResponse> items) {
        this.id = id;
        this.customerName = customerName;
        this.customerEmail = customerEmail;
        this.orderDate = orderDate;
        this.status = status;
        this.totalAmount = totalAmount;
        this.items = items;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class OrderItemResponse {
        private Long productId;
        private String productName;
        private String sku;
        private Integer quantity;
        private BigDecimal price;

        public OrderItemResponse(Long productId, String productName, String sku, Integer quantity, BigDecimal price) {
            this.productId = productId;
            this.productName = productName;
            this.sku = sku;
            this.quantity = quantity;
            this.price = price;
        }
    }
}
