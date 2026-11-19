package com.retailinventory.service;

import com.retailinventory.dto.product.ProductRequest;
import com.retailinventory.dto.product.ProductResponse;
import com.retailinventory.entity.Category;
import com.retailinventory.entity.Product;
import com.retailinventory.exception.DuplicateResourceException;
import com.retailinventory.exception.ResourceNotFoundException;
import com.retailinventory.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryService categoryService;

    public ProductService(ProductRepository productRepository, CategoryService categoryService) {
        this.productRepository = productRepository;
        this.categoryService = categoryService;
    }

    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        if (productRepository.existsBySku(request.getSku())) {
            throw new DuplicateResourceException("Product with SKU " + request.getSku() + " already exists");
        }

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryService.getCategoryEntity(request.getCategoryId());
        }

        Product product = new Product();
        product.setName(request.getName());
        product.setSku(request.getSku());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setReorderLevel(request.getReorderLevel() != null ? request.getReorderLevel() : 10);
        product.setImageUrl(request.getImageUrl());
        product.setActive(true);
        product.setCategory(category);

        Product saved = productRepository.save(product);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getAllProducts(boolean activeOnly) {
        return productRepository.findAll().stream()
                .filter(p -> !activeOnly || p.isActive())
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProductResponse getProduct(Long id) {
        return mapToResponse(getProductEntity(id));
    }
    
    @Transactional(readOnly = true)
    public Product getProductEntity(Long id) {
        return productRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
    }

    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = getProductEntity(id);

        if (!product.getSku().equals(request.getSku()) && productRepository.existsBySku(request.getSku())) {
            throw new DuplicateResourceException("Product with SKU " + request.getSku() + " already exists");
        }

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryService.getCategoryEntity(request.getCategoryId());
        }

        product.setName(request.getName());
        product.setSku(request.getSku());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setReorderLevel(request.getReorderLevel() != null ? request.getReorderLevel() : product.getReorderLevel());
        product.setImageUrl(request.getImageUrl());
        product.setCategory(category);

        Product updated = productRepository.save(product);
        return mapToResponse(updated);
    }

    @Transactional
    public void deactivateProduct(Long id) {
        Product product = getProductEntity(id);
        product.setActive(false);
        productRepository.save(product);
    }

    @Transactional
    public ProductResponse activateProduct(Long id) {
        Product product = getProductEntity(id);
        product.setActive(true);
        return mapToResponse(productRepository.save(product));
    }

    public ProductResponse mapToResponse(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getSku(),
                product.getDescription(),
                product.getPrice(),
                product.getReorderLevel(),
                product.isActive(),
                product.getImageUrl(),
                product.getCategory() != null ? product.getCategory().getName() : null,
                product.getCategory() != null ? product.getCategory().getId() : null
        );
    }
}
