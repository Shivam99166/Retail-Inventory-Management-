package com.retailinventory.dto.warehouse;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class WarehouseResponse {
    private Long id;
    private String code;
    private String name;
    private String location;
    private String manager;
    private Integer capacity;
    private boolean active;

    public WarehouseResponse(Long id, String code, String name, String location, String manager,
                             Integer capacity, boolean active) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.location = location;
        this.manager = manager;
        this.capacity = capacity;
        this.active = active;
    }
}
