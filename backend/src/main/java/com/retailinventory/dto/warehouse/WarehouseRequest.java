package com.retailinventory.dto.warehouse;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WarehouseRequest {

    @NotBlank(message = "Warehouse code is required")
    private String code;

    @NotBlank(message = "Warehouse name is required")
    private String name;

    private String location;
    private String manager;

    @PositiveOrZero(message = "Capacity must be zero or positive")
    private Integer capacity;
}
