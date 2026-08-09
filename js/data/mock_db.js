/**
 * ResolveX Mock System Database
 * Simulated backend storage for Orders, Customers, Product Warranties, and Support Tickets.
 */

const INITIAL_MOCK_DATABASE = {
  customers: [
    {
      id: "CUST-101",
      name: "Alex Rivera",
      email: "alex.rivera@example.com",
      tier: "Pro Member",
      memberSince: "2024-03-12",
      phone: "+1 (555) 234-5678",
      address: "742 Evergreen Terrace, Springfield, OR 97477"
    },
    {
      id: "CUST-102",
      name: "Sophia Chen",
      email: "sophia.chen@example.com",
      tier: "Standard",
      memberSince: "2025-01-08",
      phone: "+1 (555) 987-6543",
      address: "100 Market St, Suite 400, San Francisco, CA 94105"
    },
    {
      id: "CUST-103",
      name: "Marcus Vance",
      email: "marcus.v@example.com",
      tier: "Enterprise",
      memberSince: "2023-11-20",
      phone: "+1 (555) 456-7890",
      address: "555 Fifth Ave, New York, NY 10017"
    }
  ],

  orders: [
    {
      id: "ORD-8921",
      customerId: "CUST-101",
      customerName: "Alex Rivera",
      date: "2026-08-04",
      status: "In Transit",
      carrier: "FedEx Express",
      trackingNumber: "FX-9982310492-US",
      estimatedDelivery: "2026-08-11",
      totalAmount: 199.99,
      paymentMethod: "Visa ending in 4242",
      items: [
        { name: "ResolveX Smart Wireless Headphones Pro", qty: 1, price: 179.99, serial: "WN-99812" },
        { name: "USB-C Fast Charging Cable (2m)", qty: 2, price: 10.00 }
      ]
    },
    {
      id: "ORD-4412",
      customerId: "CUST-102",
      customerName: "Sophia Chen",
      date: "2026-07-28",
      status: "Delivered",
      carrier: "UPS Ground",
      trackingNumber: "1Z9999999999999999",
      estimatedDelivery: "2026-08-01",
      totalAmount: 349.50,
      paymentMethod: "Apple Pay",
      items: [
        { name: "ResolveX Smart Home Security Hub v2", qty: 1, price: 299.50, serial: "WN-44210" },
        { name: "Motion Sensor Expansion Pack", qty: 1, price: 50.00 }
      ]
    },
    {
      id: "ORD-3309",
      customerId: "CUST-103",
      customerName: "Marcus Vance",
      date: "2026-08-08",
      status: "Processing",
      carrier: "DHL Express",
      trackingNumber: "DHL-887123-INT",
      estimatedDelivery: "2026-08-14",
      totalAmount: 89.00,
      paymentMethod: "Mastercard ending in 8812",
      items: [
        { name: "ResolveX Ergonomic Smart Desk Lamp", qty: 1, price: 89.00, serial: "WN-33091" }
      ]
    }
  ],

  warranties: [
    {
      serialNumber: "WN-99812",
      productName: "ResolveX Smart Wireless Headphones Pro",
      ownerName: "Alex Rivera",
      purchaseDate: "2026-08-04",
      warrantyPeriod: "2 Years Limited Manufacturer",
      expiresAt: "2028-08-04",
      status: "Active",
      carePlusCovered: true
    },
    {
      serialNumber: "WN-44210",
      productName: "ResolveX Smart Home Security Hub v2",
      ownerName: "Sophia Chen",
      purchaseDate: "2026-07-28",
      warrantyPeriod: "2 Years Limited Manufacturer",
      expiresAt: "2028-07-28",
      status: "Active",
      carePlusCovered: false
    },
    {
      serialNumber: "WN-11002",
      productName: "ResolveX Bluetooth Speaker Ultra (2023 Edition)",
      ownerName: "John Doe",
      purchaseDate: "2023-01-10",
      warrantyPeriod: "1 Year Standard",
      expiresAt: "2024-01-10",
      status: "Expired",
      carePlusCovered: false
    }
  ],

  tickets: [
    {
      id: "TCK-9001",
      customerId: "CUST-102",
      customerName: "Sophia Chen",
      subject: "Security Hub Wi-Fi Disconnection issue",
      priority: "Medium",
      status: "Open",
      createdAt: "2026-08-08 14:20",
      category: "Technical Support",
      assignedAgent: "Tier-2 Tech Support",
      lastMessage: "Device drops offline every 4 hours. Rebooted twice."
    },
    {
      id: "TCK-8994",
      customerId: "CUST-101",
      customerName: "Alex Rivera",
      subject: "Shipping Address Update Request for ORD-8921",
      priority: "High",
      status: "Resolved",
      createdAt: "2026-08-05 09:15",
      category: "Shipping",
      assignedAgent: "ResolveX Support Bot (Auto)",
      lastMessage: "Address updated to 742 Evergreen Terrace."
    }
  ]
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { INITIAL_MOCK_DATABASE };
}
