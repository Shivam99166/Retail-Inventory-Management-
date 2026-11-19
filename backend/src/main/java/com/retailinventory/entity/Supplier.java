package com.retailinventory.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "suppliers")
@Getter
@Setter
public class Supplier extends BaseEntity {

    @Column(nullable = false)
    private String name;

    private String contactPerson;
    
    private String email;
    
    private String phone;
    
    private Integer leadTime; // In days

    @Column(nullable = false)
    private boolean active = true;
}
