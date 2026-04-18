export const mockProducts = [
  {
    id: 1,
    name: "Aero Jacket",
    description: "Lightweight weather-ready jacket",
    price: 129,
    stock: 44,
    is_active: true,
    category_id: 1,
    category: { id: 1, name: "Apparel" },
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: "Orbit Earbuds",
    description: "Noise-reduction wireless earbuds",
    price: 199,
    stock: 24,
    is_active: true,
    category_id: 5,
    category: { id: 5, name: "Electronics" },
    created_at: new Date().toISOString(),
  },
];

export const mockOrders = [
  {
    id: 1001,
    order_number: "SF-100001",
    user_id: 1,
    user: { id: 1, full_name: "Demo Admin", email: "admin@shopflow.dev" },
    status: "processing",
    total_amount: 258,
    created_at: new Date().toISOString(),
    items: [
      {
        id: 1,
        quantity: 2,
        unit_price: 129,
        product: mockProducts[0],
      },
    ],
  },
  {
    id: 1002,
    order_number: "SF-100002",
    user_id: 1,
    user: { id: 2, full_name: "Maya Chen", email: "maya@shopflow.dev" },
    status: "delivered",
    total_amount: 199,
    created_at: new Date().toISOString(),
    items: [
      {
        id: 2,
        quantity: 1,
        unit_price: 199,
        product: mockProducts[1],
      },
    ],
  },
];
