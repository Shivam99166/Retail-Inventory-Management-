// Temporary mock data for frontend development
export const mockProducts = [
  {
    id: 'P001',
    name: 'Wireless Noise-Cancelling Headphones',
    sku: 'AUDIO-HP-001',
    category: 'Electronics',
    description: 'High-quality wireless headphones with active noise cancellation and 30-hour battery life.',
    price: 199.99,
    reorderLevel: 10,
    availableStock: 45,
    status: 'ACTIVE'
  },
  {
    id: 'P002',
    name: 'Ergonomic Office Chair',
    sku: 'FURN-CH-002',
    category: 'Furniture',
    description: 'Adjustable ergonomic mesh chair with lumbar support for long hours of comfortable work.',
    price: 249.50,
    reorderLevel: 5,
    availableStock: 2,
    status: 'ACTIVE'
  },
  {
    id: 'P003',
    name: 'Mechanical Keyboard (Blue Switches)',
    sku: 'TECH-KB-003',
    category: 'Electronics',
    description: 'Tactile mechanical keyboard featuring customizable RGB backlighting and durable PBT keycaps.',
    price: 129.99,
    reorderLevel: 15,
    availableStock: 0,
    status: 'ACTIVE'
  },
  {
    id: 'P004',
    name: 'Stainless Steel Water Bottle 32oz',
    sku: 'HOME-WB-004',
    category: 'Home & Kitchen',
    description: 'Double-wall vacuum insulated water bottle keeps drinks cold for 24 hours or hot for 12 hours.',
    price: 24.99,
    reorderLevel: 20,
    availableStock: 150,
    status: 'ACTIVE'
  },
  {
    id: 'P005',
    name: 'Ultra HD 4K Monitor 27"',
    sku: 'TECH-MN-005',
    category: 'Electronics',
    description: 'Stunning 4K resolution monitor with IPS panel, 99% sRGB color gamut, and adjustable stand.',
    price: 349.00,
    reorderLevel: 10,
    availableStock: 8,
    status: 'ACTIVE'
  }
];

export const mockOrders = [
  {
    id: 'ORD-1001',
    date: '2023-10-15T10:30:00Z',
    status: 'DELIVERED',
    total: 224.98,
    items: [
      { product: mockProducts[0], quantity: 1, price: 199.99 },
      { product: mockProducts[3], quantity: 1, price: 24.99 }
    ],
    customer: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '555-0123',
      address: '123 Main St, Apt 4B, New York, NY 10001'
    }
  },
  {
    id: 'ORD-1002',
    date: '2023-10-18T14:45:00Z',
    status: 'PROCESSING',
    total: 349.00,
    items: [
      { product: mockProducts[4], quantity: 1, price: 349.00 }
    ],
    customer: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '555-0123',
      address: '123 Main St, Apt 4B, New York, NY 10001'
    }
  }
];

export const mockCategories = ['All', 'Electronics', 'Furniture', 'Home & Kitchen'];

export const mockWarehouses = [
  {
    id: 'WH-01',
    name: 'Central Distribution Center',
    code: 'NY-CEN',
    location: 'New York, NY',
    manager: 'Sarah Jenkins',
    capacity: 50000,
    status: 'ACTIVE'
  },
  {
    id: 'WH-02',
    name: 'West Coast Hub',
    code: 'CA-WST',
    location: 'Los Angeles, CA',
    manager: 'Michael Chang',
    capacity: 35000,
    status: 'ACTIVE'
  },
  {
    id: 'WH-03',
    name: 'Southern Overflow',
    code: 'TX-SOU',
    location: 'Austin, TX',
    manager: 'David Rodriguez',
    capacity: 20000,
    status: 'MAINTENANCE'
  }
];

export const mockSuppliers = [
  {
    id: 'SUP-01',
    name: 'TechTronics Global',
    contactPerson: 'David Chen',
    email: 'sales@techtronics.com',
    phone: '1-800-555-0199',
    leadTime: 14,
    status: 'ACTIVE'
  },
  {
    id: 'SUP-02',
    name: 'OfficeFurnish Inc.',
    contactPerson: 'Maria Garcia',
    email: 'orders@officefurnish.net',
    phone: '1-888-555-0244',
    leadTime: 30,
    status: 'ACTIVE'
  }
];

export const mockPurchaseOrders = [
  {
    id: 'PO-2023-001',
    supplierId: 'SUP-01',
    supplierName: 'TechTronics Global',
    date: '2023-10-01T00:00:00Z',
    expectedDelivery: '2023-10-15T00:00:00Z',
    totalAmount: 12500.00,
    status: 'RECEIVED'
  },
  {
    id: 'PO-2023-002',
    supplierId: 'SUP-02',
    supplierName: 'OfficeFurnish Inc.',
    date: '2023-10-25T00:00:00Z',
    expectedDelivery: '2023-11-25T00:00:00Z',
    totalAmount: 4500.50,
    status: 'SENT'
  },
  {
    id: 'PO-2023-003',
    supplierId: 'SUP-01',
    supplierName: 'TechTronics Global',
    date: '2023-10-28T00:00:00Z',
    expectedDelivery: '2023-11-11T00:00:00Z',
    totalAmount: 8200.00,
    status: 'DRAFT'
  }
];
