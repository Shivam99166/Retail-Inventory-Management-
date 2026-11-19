package com.retailinventory.dto.supplier;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class SupplierResponse {
    private Long id;
    private String name;
    private String contactPerson;
    private String email;
    private String phone;
    private Integer leadTime;
    private boolean active;

    public SupplierResponse(Long id, String name, String contactPerson, String email, String phone,
                            Integer leadTime, boolean active) {
        this.id = id;
        this.name = name;
        this.contactPerson = contactPerson;
        this.email = email;
        this.phone = phone;
        this.leadTime = leadTime;
        this.active = active;
    }
}
