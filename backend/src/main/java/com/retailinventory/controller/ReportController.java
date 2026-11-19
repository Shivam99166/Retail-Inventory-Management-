package com.retailinventory.controller;

import com.retailinventory.dto.ApiResponse;
import com.retailinventory.dto.report.DashboardReportResponse;
import com.retailinventory.dto.report.TransactionLogResponse;
import com.retailinventory.service.ReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/reports")
@PreAuthorize("hasRole('ADMIN')")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardReportResponse>> getDashboardSummary() {
        return ResponseEntity.ok(ApiResponse.success(reportService.getDashboardSummary()));
    }

    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<List<TransactionLogResponse>>> getTransactionLogs() {
        return ResponseEntity.ok(ApiResponse.success(reportService.getAllTransactions()));
    }
}
