package com.retailinventory.dto.product;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
public class ProductResponse {
    private Long id;
    private String name;
    private String sku;
    private String description;
    private BigDecimal price;
    private Integer reorderLevel;
    private boolean active;
    private String imageUrl;
    private String categoryName;
    private Long categoryId;

    public ProductResponse(Long id, String name, String sku, String description, BigDecimal price,
                           Integer reorderLevel, boolean active, String imageUrl, String categoryName, Long categoryId) {
        this.id = id;
        this.name = name;
        this.sku = sku;
        this.description = description;
        this.price = price;
        this.reorderLevel = reorderLevel;
        this.active = active;
        this.imageUrl = imageUrl;
        this.categoryName = categoryName;
        this.categoryId = categoryId;
    }
}
