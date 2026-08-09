/**
 * ResolveX Seed Knowledge Base
 * Knowledge items divided into semantic categories with document IDs, titles, content, and metadata.
 */
const INITIAL_KNOWLEDGE_BASE = [
  {
    id: "kb-101",
    title: "Global Shipping & Delivery Policy",
    category: "Shipping",
    lastUpdated: "2026-01-15",
    tags: ["shipping", "delivery", "customs", "tracking", "courier"],
    content: `ResolveX offers worldwide express and standard shipping to over 150 countries. 
Standard domestic shipping takes 3 to 5 business days, while express shipping delivers within 1 to 2 business days.
International shipping typically arrives within 5 to 10 business days depending on customs processing times.
All orders over $50 qualify for free standard shipping automatically at checkout.
Once an order is dispatched, a tracking number and courier link are emailed to the customer. You can track your package anytime using the order lookup tool or by providing your Order ID (e.g., ORD-8921).
If a package is marked as delivered but missing, please check around your property and with neighbors before contacting support within 48 hours.`
  },
  {
    id: "kb-102",
    title: "30-Day Return & Refund Guarantee Policy",
    category: "Returns",
    lastUpdated: "2026-02-01",
    tags: ["return", "refund", "exchange", "30-day", "policy", "condition"],
    content: `We stand by our products with a hassle-free 30-day return policy.
Eligible items must be returned within 30 days of original delivery date in original packaging with all included accessories.
Refunds are processed back to the original payment method within 3 to 5 business days after our warehouse receives and inspects the return.
Items damaged due to customer misuse, accident, or unauthorized modifications are not eligible for a full refund.
Restocking fees: $0 restocking fee for defective items or mistaken shipments; standard $5.99 return shipping fee applies to voluntary returns unless customer is a Pro member.
To initiate a return, request a return authorization via our support agent or order management panel.`
  },
  {
    id: "kb-103",
    title: "Hardware Product Warranty & Lifetime Guarantee Details",
    category: "Warranty",
    lastUpdated: "2026-01-20",
    tags: ["warranty", "repair", "hardware", "serial", "replacement"],
    content: `All flagship hardware products come with a 2-year Manufacturer Hardware Limited Warranty covering defects in materials and workmanship.
Extended Warranty Plans (ResolveX Care+) add 1 additional year of hardware protection and accidental damage coverage (up to 2 claims per year with a $25 deductible).
Warranty service includes free repair or replacement with a refurbished unit of equal or greater specifications.
To claim warranty service, customers must provide a valid product serial number (e.g., WN-99812 or WN-44210) and proof of purchase.
Normal wear and tear, cosmetic damage, water damage (unless IP68 certified), and battery degradation below 80% capacity after 500 cycles are handled under standard service rates.`
  },
  {
    id: "kb-104",
    title: "Account Security, Passwords & Two-Factor Authentication (2FA)",
    category: "Account",
    lastUpdated: "2026-01-10",
    tags: ["account", "security", "password", "2fa", "login", "reset"],
    content: `Customer security is our top priority. Accounts support Two-Factor Authentication (2FA) via Authenticator App (TOTP) or SMS security codes.
If you forget your account password, click "Forgot Password" on the login page to receive a password reset link valid for 1 hour.
If your account is locked due to multiple failed login attempts, wait 15 minutes or contact support to verify identity and unlock your account.
Support agents will never ask for your password, credit card CVV, or 2FA authentication codes.
You can update your email address, phone number, and billing preferences anytime in the Account Profile Settings panel.`
  },
  {
    id: "kb-105",
    title: "Product Troubleshooting & Technical Specifications",
    category: "Technical",
    lastUpdated: "2026-02-05",
    tags: ["specs", "troubleshooting", "bluetooth", "power", "reset", "firmware"],
    content: `Common troubleshooting steps for ResolveX Smart Hub and Audio devices:
1. Factory Reset: Hold the action button for 10 seconds until the LED light flashes amber, then release.
2. Bluetooth Pairing: Press and hold the Bluetooth button for 3 seconds until the indicator pulses blue, then select ResolveX device in your phone settings.
3. Firmware Updates: Firmware is updated automatically over Wi-Fi overnight when connected to power and idle. Manual updates can be pushed via the ResolveX Mobile App under Device Settings > System > Update.
4. Battery Charging: Fast charging supports 0% to 80% charge in 35 minutes using USB-C PD 30W charger.`
  },
  {
    id: "kb-106",
    title: "Subscription Plans, Billing Cycles & Cancellation",
    category: "Billing",
    lastUpdated: "2026-01-28",
    tags: ["subscription", "billing", "cancel", "membership", "invoice", "pro"],
    content: `ResolveX offers Monthly and Annual subscription tiers (Basic Free, Pro $14.99/mo, Enterprise $49.99/mo).
Billing recurs automatically on your billing cycle date. Invoices are sent via email and accessible in Account > Billing History.
You can upgrade, downgrade, or cancel your subscription at any time without penalty.
Upon cancellation, your premium benefits remain active until the end of your current paid billing period.
Partial month refunds are not issued for mid-cycle cancellations, but account credits may be granted by customer service for service disruptions.`
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { INITIAL_KNOWLEDGE_BASE };
}
