package com.retailinventory.service;

import com.retailinventory.dto.order.OrderItemRequest;
import com.retailinventory.dto.order.OrderRequest;
import com.retailinventory.dto.order.OrderResponse;
import com.retailinventory.entity.Inventory;
import com.retailinventory.entity.Order;
import com.retailinventory.entity.OrderItem;
import com.retailinventory.entity.Product;
import com.retailinventory.entity.StockTransaction;
import com.retailinventory.entity.User;
import com.retailinventory.entity.enums.OrderStatus;
import com.retailinventory.entity.enums.StockTransactionType;
import com.retailinventory.exception.BusinessException;
import com.retailinventory.exception.ResourceNotFoundException;
import com.retailinventory.exception.UnauthorizedException;
import com.retailinventory.repository.InventoryRepository;
import com.retailinventory.repository.OrderRepository;
import com.retailinventory.repository.StockTransactionRepository;
import com.retailinventory.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductService productService;
    private final InventoryRepository inventoryRepository;
    private final StockTransactionRepository stockTransactionRepository;

    public OrderService(OrderRepository orderRepository,
                        UserRepository userRepository,
                        ProductService productService,
                        InventoryRepository inventoryRepository,
                        StockTransactionRepository stockTransactionRepository) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.productService = productService;
        this.inventoryRepository = inventoryRepository;
        this.stockTransactionRepository = stockTransactionRepository;
    }

    @Transactional
    public OrderResponse placeOrder(String email, OrderRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Order order = new Order();
        order.setCustomer(user);
        order.setOrderDate(LocalDateTime.now());
        order.setStatus(OrderStatus.PENDING);
        
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (OrderItemRequest itemReq : request.getItems()) {
            Product product = productService.getProductEntity(itemReq.getProductId());
            
            // Validate if total network stock is sufficient before even placing pending order
            int totalStock = inventoryRepository.findAll().stream()
                    .filter(inv -> inv.getProduct().getId().equals(product.getId()))
                    .mapToInt(inv -> inv.getAvailableStock())
                    .sum();
                    
            if (totalStock < itemReq.getQuantity()) {
                throw new BusinessException("Insufficient stock across all warehouses for product: " + product.getName());
            }

            OrderItem item = new OrderItem();
            item.setProduct(product);
            item.setQuantity(itemReq.getQuantity());
            item.setPrice(product.getPrice());
            order.addItem(item);
            
            BigDecimal itemTotal = product.getPrice().multiply(new BigDecimal(itemReq.getQuantity()));
            totalAmount = totalAmount.add(itemTotal);
        }

        order.setTotalAmount(totalAmount);
        return mapToResponse(orderRepository.save(order));
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getUserOrders(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                
        return orderRepository.findAll().stream()
                .filter(o -> o.getCustomer().getId().equals(user.getId()))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrderResponse getUserOrderDetails(String email, Long orderId) {
        Order order = getOrderEntity(orderId);
        if (!order.getCustomer().getEmail().equals(email)) {
            throw new UnauthorizedException("You can only view your own orders");
        }
        return mapToResponse(order);
    }

    // ADMIN METHODS

    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public OrderResponse confirmOrder(Long id) {
        Order order = getOrderEntity(id);
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new BusinessException("Only PENDING orders can be confirmed");
        }

        // Deduct Stock
        for (OrderItem item : order.getItems()) {
            List<Inventory> inventories = inventoryRepository.findAll().stream()
                    .filter(inv -> inv.getProduct().getId().equals(item.getProduct().getId()) && inv.getAvailableStock() > 0)
                    .collect(Collectors.toList());

            int remainingToDeduct = item.getQuantity();

            for (Inventory inv : inventories) {
                if (remainingToDeduct <= 0) break;

                int deduct = Math.min(inv.getAvailableStock(), remainingToDeduct);
                inv.setAvailableStock(inv.getAvailableStock() - deduct);
                remainingToDeduct -= deduct;
                inventoryRepository.save(inv);

                // Log Transaction
                StockTransaction tx = new StockTransaction();
                tx.setProduct(item.getProduct());
                tx.setWarehouse(inv.getWarehouse());
                tx.setQuantity(-deduct);
                tx.setType(StockTransactionType.SALE);
                tx.setReference("ORD-" + order.getId());
                tx.setTransactionDate(LocalDateTime.now());
                stockTransactionRepository.save(tx);
            }

            if (remainingToDeduct > 0) {
                throw new BusinessException("Critical error: Stock dropped before confirmation for product " + item.getProduct().getSku());
            }
        }

        order.setStatus(OrderStatus.CONFIRMED);
        return mapToResponse(orderRepository.save(order));
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long id, OrderStatus newStatus) {
        Order order = getOrderEntity(id);
        
        // Cannot randomly go back to PENDING or jump states easily, but for brevity we allow admin forced updates
        // Except CANCELLED requires logic if it was already stock-deducted
        if (newStatus == OrderStatus.CANCELLED) {
            return cancelOrder(id);
        }
        
        order.setStatus(newStatus);
        return mapToResponse(orderRepository.save(order));
    }

    @Transactional
    public OrderResponse cancelOrder(Long id) {
        Order order = getOrderEntity(id);
        
        if (order.getStatus() == OrderStatus.DELIVERED) {
            throw new BusinessException("Cannot cancel an already delivered order");
        }

        // If stock was already deducted (Confirmed, Processing, Shipped), return it
        if (order.getStatus() == OrderStatus.CONFIRMED || 
            order.getStatus() == OrderStatus.PROCESSING || 
            order.getStatus() == OrderStatus.SHIPPED) {
            
            for (OrderItem item : order.getItems()) {
                // Find ANY warehouse holding this product to return the stock. 
                // In a perfect system we return to the exact warehouse, but this is a simplified fallback.
                Inventory inv = inventoryRepository.findAll().stream()
                        .filter(i -> i.getProduct().getId().equals(item.getProduct().getId()))
                        .findFirst()
                        .orElseThrow(() -> new BusinessException("No warehouse found to return cancelled stock"));

                inv.setAvailableStock(inv.getAvailableStock() + item.getQuantity());
                inventoryRepository.save(inv);

                // Log return transaction
                StockTransaction tx = new StockTransaction();
                tx.setProduct(item.getProduct());
                tx.setWarehouse(inv.getWarehouse());
                tx.setQuantity(item.getQuantity());
                tx.setType(StockTransactionType.RETURN);
                tx.setReference("ORD-CANCEL-" + order.getId());
                tx.setTransactionDate(LocalDateTime.now());
                stockTransactionRepository.save(tx);
            }
        }

        order.setStatus(OrderStatus.CANCELLED);
        return mapToResponse(orderRepository.save(order));
    }

    private Order getOrderEntity(Long id) {
        return orderRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new ResourceNotFoundException("Order", id));
    }

    private OrderResponse mapToResponse(Order order) {
        List<OrderResponse.OrderItemResponse> items = order.getItems().stream()
                .map(item -> new OrderResponse.OrderItemResponse(
                        item.getProduct().getId(),
                        item.getProduct().getName(),
                        item.getProduct().getSku(),
                        item.getQuantity(),
                        item.getPrice()
                )).collect(Collectors.toList());

        return new OrderResponse(
                order.getId(),
                order.getCustomer().getName(),
                order.getCustomer().getEmail(),
                order.getOrderDate(),
                order.getStatus().name(),
                order.getTotalAmount(),
                items
        );
    }
}
