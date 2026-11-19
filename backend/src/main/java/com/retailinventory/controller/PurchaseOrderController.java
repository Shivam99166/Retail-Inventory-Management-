package com.retailinventory.controller;

import com.retailinventory.dto.ApiResponse;
import com.retailinventory.dto.purchaseorder.PurchaseOrderRequest;
import com.retailinventory.dto.purchaseorder.PurchaseOrderResponse;
import com.retailinventory.service.PurchaseOrderService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/purchase-orders")
@PreAuthorize("hasRole('ADMIN')")
public class PurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;

    public PurchaseOrderController(PurchaseOrderService purchaseOrderService) {
        this.purchaseOrderService = purchaseOrderService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PurchaseOrderResponse>>> getAllPurchaseOrders() {
        return ResponseEntity.ok(ApiResponse.success(purchaseOrderService.getAllPurchaseOrders()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PurchaseOrderResponse>> getPurchaseOrder(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(purchaseOrderService.getPurchaseOrder(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PurchaseOrderResponse>> createPurchaseOrder(@Valid @RequestBody PurchaseOrderRequest request) {
        PurchaseOrderResponse response = purchaseOrderService.createPurchaseOrder(request);
        return ResponseEntity.ok(ApiResponse.success("Purchase order drafted successfully", response));
    }

    @PutMapping("/{id}/submit")
    public ResponseEntity<ApiResponse<PurchaseOrderResponse>> submitOrder(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Order submitted to supplier", purchaseOrderService.submitOrder(id)));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<PurchaseOrderResponse>> approveOrder(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Order approved", purchaseOrderService.approveOrder(id)));
    }

    @PutMapping("/{id}/receive")
    public ResponseEntity<ApiResponse<PurchaseOrderResponse>> receiveOrder(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Stock received and added to inventory", purchaseOrderService.receiveOrder(id)));
    }
    
    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<PurchaseOrderResponse>> cancelOrder(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Order cancelled", purchaseOrderService.cancelOrder(id)));
    }
}
