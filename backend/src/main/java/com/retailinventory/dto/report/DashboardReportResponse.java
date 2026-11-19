package com.retailinventory.dto.report;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
public class DashboardReportResponse {
    private long totalProducts;
    private long totalWarehouses;
    private long lowStockItems;
    private long outOfStockItems;
    private long pendingOrders;
    private long pendingTransfers;
    private BigDecimal totalRevenue;

    public DashboardReportResponse(long totalProducts, long totalWarehouses, long lowStockItems,
                                   long outOfStockItems, long pendingOrders, long pendingTransfers,
                                   BigDecimal totalRevenue) {
        this.totalProducts = totalProducts;
        this.totalWarehouses = totalWarehouses;
        this.lowStockItems = lowStockItems;
        this.outOfStockItems = outOfStockItems;
        this.pendingOrders = pendingOrders;
        this.pendingTransfers = pendingTransfers;
        this.totalRevenue = totalRevenue;
    }
}
