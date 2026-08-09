/**
 * ResolveX Mock System Database
 * Simulated backend storage for Orders, Customers, Product Warranties, Support Tickets,
 * Shipping Rates, Developer API Keys, and Infrastructure Health Telemetry.
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
    },
    {
      id: "CUST-104",
      name: "Elena Rostova",
      email: "elena.rostova@techcorp.io",
      tier: "Enterprise VIP",
      memberSince: "2023-05-14",
      phone: "+1 (555) 888-1234",
      address: "200 Technology Square, Cambridge, MA 02139"
    },
    {
      id: "CUST-105",
      name: "David Miller",
      email: "d.miller@example.org",
      tier: "Pro Member",
      memberSince: "2024-09-01",
      phone: "+1 (555) 321-9988",
      address: "432 Austin Blvd, Suite 12, Austin, TX 78701"
    },
    {
      id: "CUST-106",
      name: "Amara Okafor",
      email: "amara.o@globaltrade.co",
      tier: "Enterprise",
      memberSince: "2024-02-19",
      phone: "+1 (555) 777-6543",
      address: "888 Michigan Ave, Chicago, IL 60611"
    },
    {
      id: "CUST-107",
      name: "Liam O'Connor",
      email: "liam.oconnor@example.ie",
      tier: "Standard",
      memberSince: "2025-02-01",
      phone: "+353 1 496 0123",
      address: "14 Grafton Street, Dublin 2, Ireland"
    },
    {
      id: "CUST-108",
      name: "Yuki Tanaka",
      email: "y.tanaka@tokyosmart.jp",
      tier: "Pro Member",
      memberSince: "2024-06-11",
      phone: "+81 3 5555 0199",
      address: "1-1 Chiyoda, Chiyoda-ku, Tokyo 100-8111, Japan"
    },
    {
      id: "CUST-109",
      name: "Carlos Mendez",
      email: "carlos.mendez@example.com",
      tier: "Standard",
      memberSince: "2025-01-22",
      phone: "+1 (555) 654-3210",
      address: "1200 Biscayne Blvd, Miami, FL 33132"
    },
    {
      id: "CUST-110",
      name: "Rachel Green",
      email: "rachel.g@centralperk.com",
      tier: "Pro Member",
      memberSince: "2024-10-05",
      phone: "+1 (555) 222-3344",
      address: "90 Bedford St, Apt 20, New York, NY 10014"
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
    },
    {
      id: "ORD-7711",
      customerId: "CUST-104",
      customerName: "Elena Rostova",
      date: "2026-08-02",
      status: "In Transit",
      carrier: "FedEx International Priority",
      trackingNumber: "FX-110029381-INT",
      estimatedDelivery: "2026-08-12",
      totalAmount: 1499.00,
      paymentMethod: "Corporate Amex ending in 1004",
      items: [
        { name: "ResolveX Security Hub Enterprise Bundle (5 Pack)", qty: 1, price: 1299.00, serial: "WN-77110" },
        { name: "Care+ Enterprise 3-Year Protection Plan", qty: 1, price: 200.00 }
      ]
    },
    {
      id: "ORD-5520",
      customerId: "CUST-105",
      customerName: "David Miller",
      date: "2026-08-06",
      status: "Processing",
      carrier: "USPS Priority",
      trackingNumber: "9400100000000000000000",
      estimatedDelivery: "2026-08-10",
      totalAmount: 129.99,
      paymentMethod: "PayPal",
      items: [
        { name: "ResolveX Bluetooth Speaker Ultra", qty: 1, price: 129.99, serial: "WN-55201" }
      ]
    },
    {
      id: "ORD-9012",
      customerId: "CUST-106",
      customerName: "Amara Okafor",
      date: "2026-07-20",
      status: "Delivered",
      carrier: "DHL Express",
      trackingNumber: "DHL-901284-US",
      estimatedDelivery: "2026-07-24",
      totalAmount: 499.00,
      paymentMethod: "Visa ending in 9081",
      items: [
        { name: "ResolveX Audio Master Wireless Studio Headset", qty: 1, price: 499.00, serial: "WN-90120" }
      ]
    },
    {
      id: "ORD-2041",
      customerId: "CUST-107",
      customerName: "Liam O'Connor",
      date: "2026-08-01",
      status: "Delivered",
      carrier: "An Post Express",
      trackingNumber: "IE-881920-EU",
      estimatedDelivery: "2026-08-05",
      totalAmount: 219.00,
      paymentMethod: "Mastercard ending in 3319",
      items: [
        { name: "ResolveX Smart Home Security Hub v2", qty: 1, price: 219.00, serial: "WN-20411" }
      ]
    },
    {
      id: "ORD-6632",
      customerId: "CUST-108",
      customerName: "Yuki Tanaka",
      date: "2026-08-07",
      status: "In Transit",
      carrier: "Japan Post EMS",
      trackingNumber: "JP-771239-GLOBAL",
      estimatedDelivery: "2026-08-13",
      totalAmount: 380.00,
      paymentMethod: "JCB ending in 4410",
      items: [
        { name: "ResolveX Smart Wireless Headphones Pro (Limited Red)", qty: 1, price: 220.00, serial: "WN-66321" },
        { name: "Care+ Accidental Damage Plan", qty: 1, price: 160.00 }
      ]
    },
    {
      id: "ORD-1105",
      customerId: "CUST-109",
      customerName: "Carlos Mendez",
      date: "2026-07-15",
      status: "Refunded",
      carrier: "UPS Ground",
      trackingNumber: "1Z11059999888877",
      estimatedDelivery: "2026-07-19",
      totalAmount: 179.99,
      paymentMethod: "Visa ending in 0019",
      items: [
        { name: "ResolveX Smart Wireless Headphones Pro", qty: 1, price: 179.99, serial: "WN-11051" }
      ]
    },
    {
      id: "ORD-9988",
      customerId: "CUST-110",
      customerName: "Rachel Green",
      date: "2026-08-05",
      status: "Processing",
      carrier: "FedEx Express",
      trackingNumber: "FX-9988776655-US",
      estimatedDelivery: "2026-08-09",
      totalAmount: 95.00,
      paymentMethod: "Apple Pay",
      items: [
        { name: "ResolveX Smart Desk Lamp Dimmer Pack", qty: 1, price: 95.00, serial: "WN-99881" }
      ]
    },
    {
      id: "ORD-4001",
      customerId: "CUST-101",
      customerName: "Alex Rivera",
      date: "2026-05-10",
      status: "Delivered",
      carrier: "FedEx Express",
      trackingNumber: "FX-4001928374-US",
      estimatedDelivery: "2026-05-13",
      totalAmount: 149.99,
      paymentMethod: "Visa ending in 4242",
      items: [
        { name: "ResolveX Bluetooth Speaker Ultra (2024)", qty: 1, price: 149.99, serial: "WN-40011" }
      ]
    },
    {
      id: "ORD-1290",
      customerId: "CUST-103",
      customerName: "Marcus Vance",
      date: "2026-06-20",
      status: "Delivered",
      carrier: "DHL Express",
      trackingNumber: "DHL-129088-US",
      estimatedDelivery: "2026-06-22",
      totalAmount: 850.00,
      paymentMethod: "Mastercard ending in 8812",
      items: [
        { name: "ResolveX Enterprise Multi-Room Hub Network", qty: 1, price: 850.00, serial: "WN-12901" }
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
      serialNumber: "WN-33091",
      productName: "ResolveX Ergonomic Smart Desk Lamp",
      ownerName: "Marcus Vance",
      purchaseDate: "2026-08-08",
      warrantyPeriod: "2 Years Limited Manufacturer",
      expiresAt: "2028-08-08",
      status: "Active",
      carePlusCovered: true
    },
    {
      serialNumber: "WN-77110",
      productName: "ResolveX Security Hub Enterprise Bundle",
      ownerName: "Elena Rostova",
      purchaseDate: "2026-08-02",
      warrantyPeriod: "3 Years Enterprise Care+",
      expiresAt: "2029-08-02",
      status: "Active",
      carePlusCovered: true
    },
    {
      serialNumber: "WN-55201",
      productName: "ResolveX Bluetooth Speaker Ultra",
      ownerName: "David Miller",
      purchaseDate: "2026-08-06",
      warrantyPeriod: "2 Years Limited Manufacturer",
      expiresAt: "2028-08-06",
      status: "Active",
      carePlusCovered: false
    },
    {
      serialNumber: "WN-90120",
      productName: "ResolveX Audio Master Wireless Studio Headset",
      ownerName: "Amara Okafor",
      purchaseDate: "2026-07-20",
      warrantyPeriod: "2 Years Limited Manufacturer",
      expiresAt: "2028-07-20",
      status: "Active",
      carePlusCovered: true
    },
    {
      serialNumber: "WN-20411",
      productName: "ResolveX Smart Home Security Hub v2",
      ownerName: "Liam O'Connor",
      purchaseDate: "2026-08-01",
      warrantyPeriod: "2 Years Limited Manufacturer",
      expiresAt: "2028-08-01",
      status: "Active",
      carePlusCovered: false
    },
    {
      serialNumber: "WN-66321",
      productName: "ResolveX Smart Wireless Headphones Pro",
      ownerName: "Yuki Tanaka",
      purchaseDate: "2026-08-07",
      warrantyPeriod: "3 Years Care+ Complete",
      expiresAt: "2029-08-07",
      status: "Active",
      carePlusCovered: true
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
    },
    {
      serialNumber: "WN-40011",
      productName: "ResolveX Bluetooth Speaker Ultra (2024)",
      ownerName: "Alex Rivera",
      purchaseDate: "2026-05-10",
      warrantyPeriod: "2 Years Limited Manufacturer",
      expiresAt: "2028-05-10",
      status: "Active",
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
    },
    {
      id: "TCK-9005",
      customerId: "CUST-104",
      customerName: "Elena Rostova",
      subject: "Enterprise API Webhook HMAC Verification Failure",
      priority: "Urgent",
      status: "Open",
      createdAt: "2026-08-09 10:05",
      category: "Technical Support",
      assignedAgent: "Senior Developer Relations",
      lastMessage: "Webhook signatures returning 401 Unauthorized on staging cluster."
    },
    {
      id: "TCK-9008",
      customerId: "CUST-103",
      customerName: "Marcus Vance",
      subject: "Custom Invoice Request for Tax Exemption",
      priority: "Low",
      status: "Open",
      createdAt: "2026-08-09 11:30",
      category: "Billing",
      assignedAgent: "Enterprise Billing Ops",
      lastMessage: "Requires tax-exempt certificate approval for ORD-3309."
    },
    {
      id: "TCK-8982",
      customerId: "CUST-106",
      customerName: "Amara Okafor",
      subject: "On-Site Hardware Technician Booking Request",
      priority: "High",
      status: "In Progress",
      createdAt: "2026-08-07 16:45",
      category: "Field Service",
      assignedAgent: "Chicago Field Ops",
      lastMessage: "Technician scheduled for 2026-08-11 10:00 AM."
    },
    {
      id: "TCK-8975",
      customerId: "CUST-105",
      customerName: "David Miller",
      subject: "Bluetooth Audio Latency on macOS Sonoma",
      priority: "Medium",
      status: "Resolved",
      createdAt: "2026-08-06 12:10",
      category: "Technical Support",
      assignedAgent: "Audio Firmware Lead",
      lastMessage: "Guided user through AAC codec configuration update."
    },
    {
      id: "TCK-8960",
      customerId: "CUST-108",
      customerName: "Yuki Tanaka",
      subject: "Care+ Claim: Headphones Water Splash Damage",
      priority: "High",
      status: "In Progress",
      createdAt: "2026-08-08 08:50",
      category: "Warranty",
      assignedAgent: "Care+ Claims Desk",
      lastMessage: "Care+ claim approved. Replacement unit prepared."
    },
    {
      id: "TCK-8951",
      customerId: "CUST-107",
      customerName: "Liam O'Connor",
      subject: "Customs Duty VAT Inquiry for Ireland Shipment",
      priority: "Low",
      status: "Resolved",
      createdAt: "2026-08-03 15:00",
      category: "Shipping",
      assignedAgent: "EU Logistics Team",
      lastMessage: "Confirmed DDP payment settled by shipper."
    },
    {
      id: "TCK-8940",
      customerId: "CUST-109",
      customerName: "Carlos Mendez",
      subject: "Refund Status Confirmation for ORD-1105",
      priority: "Medium",
      status: "Resolved",
      createdAt: "2026-07-16 11:25",
      category: "Billing",
      assignedAgent: "ResolveX Support Bot (Auto)",
      lastMessage: "Refund of $179.99 credited back to Visa."
    },
    {
      id: "TCK-8933",
      customerId: "CUST-110",
      customerName: "Rachel Green",
      subject: "GDPR Personal Data Archive Request",
      priority: "Low",
      status: "Open",
      createdAt: "2026-08-09 09:00",
      category: "Security & Privacy",
      assignedAgent: "Compliance Officer",
      lastMessage: "Data export pipeline executing via MCP Data Export tool."
    }
  ],

  apiKeys: [
    { keyId: "AK_PRO_881920", customerId: "CUST-101", name: "Production Gateway", rateLimit: "10,000 req/hr", status: "Active" },
    { keyId: "AK_ENT_990182", customerId: "CUST-104", name: "Enterprise Staging Hub", rateLimit: "Unlimited", status: "Active" }
  ],

  systemHealth: {
    status: "OPERATIONAL",
    uptime: "99.98%",
    clusterLatencyMs: 14,
    activeNodes: 12,
    mcpServices: "Healthy",
    ragEngineStatus: "Indexed (20 Docs, 74 Chunks)",
    regions: [
      { name: "US-East (N. Virginia)", ping: "8ms", status: "Operational" },
      { name: "US-West (Oregon)", ping: "22ms", status: "Operational" },
      { name: "EU-Central (Frankfurt)", ping: "84ms", status: "Operational" },
      { name: "AP-Northeast (Tokyo)", ping: "140ms", status: "Operational" }
    ]
  },

  shippingRates: {
    "US": { standard: 0, express: 15.00, carrier: "FedEx Express" },
    "CA": { standard: 12.00, express: 25.00, carrier: "UPS International" },
    "EU": { standard: 18.00, express: 35.00, carrier: "DHL Express" },
    "JP": { standard: 20.00, express: 40.00, carrier: "Japan Post EMS" },
    "UK": { standard: 15.00, express: 30.00, carrier: "Royal Mail / DHL" }
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { INITIAL_MOCK_DATABASE };
}
