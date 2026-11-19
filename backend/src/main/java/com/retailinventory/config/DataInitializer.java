package com.retailinventory.config;

import com.retailinventory.entity.Category;
import com.retailinventory.entity.Inventory;
import com.retailinventory.entity.Product;
import com.retailinventory.entity.Supplier;
import com.retailinventory.entity.Warehouse;
import com.retailinventory.repository.CategoryRepository;
import com.retailinventory.repository.InventoryRepository;
import com.retailinventory.repository.ProductRepository;
import com.retailinventory.repository.SupplierRepository;
import com.retailinventory.repository.WarehouseRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Component
public class DataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final WarehouseRepository warehouseRepository;
    private final SupplierRepository supplierRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;

    public DataInitializer(CategoryRepository categoryRepository,
                           WarehouseRepository warehouseRepository,
                           SupplierRepository supplierRepository,
                           ProductRepository productRepository,
                           InventoryRepository inventoryRepository) {
        this.categoryRepository = categoryRepository;
        this.warehouseRepository = warehouseRepository;
        this.supplierRepository = supplierRepository;
        this.productRepository = productRepository;
        this.inventoryRepository = inventoryRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        // 1. Categories
        Category electronics = categoryRepository.findAll().stream()
                .filter(c -> c.getName().equalsIgnoreCase("Electronics"))
                .findFirst()
                .orElseGet(() -> {
                    Category cat = new Category();
                    cat.setName("Electronics");
                    cat.setDescription("Electronic gadgets and accessories");
                    return categoryRepository.save(cat);
                });

        Category furniture = categoryRepository.findAll().stream()
                .filter(c -> c.getName().equalsIgnoreCase("Furniture"))
                .findFirst()
                .orElseGet(() -> {
                    Category cat = new Category();
                    cat.setName("Furniture");
                    cat.setDescription("Home and office furniture");
                    return categoryRepository.save(cat);
                });

        Category homeKitchen = categoryRepository.findAll().stream()
                .filter(c -> c.getName().equalsIgnoreCase("Home & Kitchen"))
                .findFirst()
                .orElseGet(() -> {
                    Category cat = new Category();
                    cat.setName("Home & Kitchen");
                    cat.setDescription("Everyday home essentials and kitchenware");
                    return categoryRepository.save(cat);
                });

        // 2. Warehouses
        Warehouse wh1 = warehouseRepository.findAll().stream()
                .filter(w -> "NY-CEN".equalsIgnoreCase(w.getCode()))
                .findFirst()
                .orElseGet(() -> {
                    Warehouse w = new Warehouse();
                    w.setCode("NY-CEN");
                    w.setName("Central Distribution Center");
                    w.setLocation("New York, NY");
                    w.setManager("Sarah Jenkins");
                    w.setCapacity(50000);
                    w.setActive(true);
                    return warehouseRepository.save(w);
                });

        Warehouse wh2 = warehouseRepository.findAll().stream()
                .filter(w -> "CA-WST".equalsIgnoreCase(w.getCode()))
                .findFirst()
                .orElseGet(() -> {
                    Warehouse w = new Warehouse();
                    w.setCode("CA-WST");
                    w.setName("West Coast Hub");
                    w.setLocation("Los Angeles, CA");
                    w.setManager("Michael Chang");
                    w.setCapacity(35000);
                    w.setActive(true);
                    return warehouseRepository.save(w);
                });

        // 3. Suppliers
        if (supplierRepository.count() == 0) {
            Supplier sup1 = new Supplier();
            sup1.setName("TechTronics Global");
            sup1.setContactPerson("David Chen");
            sup1.setEmail("sales@techtronics.com");
            sup1.setPhone("1-800-555-0199");
            sup1.setLeadTime(14);
            sup1.setActive(true);
            supplierRepository.save(sup1);

            Supplier sup2 = new Supplier();
            sup2.setName("OfficeFurnish Inc.");
            sup2.setContactPerson("Maria Garcia");
            sup2.setEmail("orders@officefurnish.net");
            sup2.setPhone("1-888-555-0244");
            sup2.setLeadTime(30);
            sup2.setActive(true);
            supplierRepository.save(sup2);
        }

        // 4. Products & Inventory
        createOrUpdateProductWithStock("Wireless Noise-Cancelling Headphones", "AUDIO-HP-001",
                "High-quality wireless headphones with active noise cancellation.",
                new BigDecimal("199.99"), 10, electronics, wh1, 50, "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80");

        createOrUpdateProductWithStock("Ergonomic Office Chair", "FURN-CH-002",
                "Adjustable ergonomic mesh chair with lumbar support.",
                new BigDecimal("249.50"), 5, furniture, wh1, 25, "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=800&q=80");

        createOrUpdateProductWithStock("Mechanical Keyboard (Blue Switches)", "TECH-KB-003",
                "Tactile mechanical keyboard featuring customizable RGB backlighting.",
                new BigDecimal("129.99"), 15, electronics, wh2, 40, "https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80");

        createOrUpdateProductWithStock("Stainless Steel Water Bottle 32oz", "HOME-WB-004",
                "Double-wall vacuum insulated water bottle keeps drinks cold.",
                new BigDecimal("24.99"), 20, homeKitchen, wh1, 150, "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80");

        createOrUpdateProductWithStock("Ultra HD 4K Monitor 27\"", "TECH-MN-005",
                "Stunning 4K resolution monitor with IPS panel and 99% sRGB.",
                new BigDecimal("349.00"), 10, electronics, wh2, 30, "/images/4k_monitor.jpg");

        createOrUpdateProductWithStock("Smart Home Speaker", "TECH-SP-006",
                "Voice-controlled smart speaker with rich sound and built-in assistant.",
                new BigDecimal("89.99"), 20, electronics, wh1, 100, "/images/smart_speaker.jpg");

        createOrUpdateProductWithStock("Coffee Maker Machine", "HOME-CM-007",
                "Programmable drip coffee maker with 12-cup capacity and thermal carafe.",
                new BigDecimal("120.00"), 15, homeKitchen, wh2, 60, "/images/coffee_maker.jpg");

        createOrUpdateProductWithStock("Modern Minimalist Desk", "FURN-DK-008",
                "Sleek wooden desk with metal frame, perfect for home office.",
                new BigDecimal("180.00"), 10, furniture, wh1, 20, "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&q=80");
    }

    private void createOrUpdateProductWithStock(String name, String sku, String desc, BigDecimal price,
                                        int reorderLevel, Category cat, Warehouse wh, int stock, String imageUrl) {
        Product product = productRepository.findAll().stream()
                .filter(p -> p.getSku().equals(sku))
                .findFirst()
                .orElse(new Product());

        product.setName(name);
        product.setSku(sku);
        product.setDescription(desc);
        product.setPrice(price);
        product.setReorderLevel(reorderLevel);
        product.setImageUrl(imageUrl);
        product.setActive(true);
        product.setCategory(cat);
        Product savedProduct = productRepository.save(product);

        if (product.getId() == null || inventoryRepository.findAll().stream().noneMatch(i -> i.getProduct().getId().equals(savedProduct.getId()))) {
            Inventory inv = new Inventory();
            inv.setProduct(savedProduct);
            inv.setWarehouse(wh);
            inv.setAvailableStock(stock);
            inventoryRepository.save(inv);
        }
    }
}
