package com.retailinventory.controller;

import com.retailinventory.dto.ApiResponse;
import com.retailinventory.dto.stocktransfer.StockTransferRequest;
import com.retailinventory.dto.stocktransfer.StockTransferResponse;
import com.retailinventory.service.StockTransferService;
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
@RequestMapping("/api/admin/transfers")
@PreAuthorize("hasRole('ADMIN')")
public class StockTransferController {

    private final StockTransferService stockTransferService;

    public StockTransferController(StockTransferService stockTransferService) {
        this.stockTransferService = stockTransferService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<StockTransferResponse>>> getAllTransfers() {
        return ResponseEntity.ok(ApiResponse.success(stockTransferService.getAllTransfers()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<StockTransferResponse>> requestTransfer(@Valid @RequestBody StockTransferRequest request) {
        StockTransferResponse response = stockTransferService.requestTransfer(request);
        return ResponseEntity.ok(ApiResponse.success("Transfer requested successfully", response));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<StockTransferResponse>> approveTransfer(@PathVariable Long id) {
        StockTransferResponse response = stockTransferService.approveTransfer(id);
        return ResponseEntity.ok(ApiResponse.success("Transfer approved and stock moved", response));
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<StockTransferResponse>> completeTransfer(@PathVariable Long id) {
        StockTransferResponse response = stockTransferService.completeTransfer(id);
        return ResponseEntity.ok(ApiResponse.success("Transfer marked as completed", response));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<StockTransferResponse>> cancelTransfer(@PathVariable Long id) {
        StockTransferResponse response = stockTransferService.cancelTransfer(id);
        return ResponseEntity.ok(ApiResponse.success("Transfer cancelled", response));
    }
}
