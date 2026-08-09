/**
 * ResolveX Seed Knowledge Base
 * 20 Comprehensive Knowledge Base Articles covering Shipping, Returns, Warranty,
 * Security, Technical & IoT Integrations, and Billing & Enterprise SLAs.
 */
const INITIAL_KNOWLEDGE_BASE = [
  {
    id: "kb-101",
    title: "Global Shipping, Transit Times & Tracking Policy",
    category: "Shipping",
    lastUpdated: "2026-02-01",
    tags: ["shipping", "delivery", "customs", "tracking", "courier", "express", "international"],
    content: `ResolveX offers worldwide express and standard shipping to over 150 countries.
Standard domestic shipping takes 3 to 5 business days, while express shipping delivers within 1 to 2 business days.
International shipping typically arrives within 5 to 10 business days depending on customs processing times and destination tariffs.
All orders over $50 qualify for free standard shipping automatically at checkout.
Once an order is dispatched, a tracking number (e.g., FX-9982310492-US or DHL-887123-INT) and courier link are emailed to the customer.
If a package is marked as delivered but missing, please inspect the delivery zone and check with neighbors before initiating a stolen item trace with support within 48 hours.`
  },
  {
    id: "kb-102",
    title: "30-Day Return & Full Refund Guarantee Policy",
    category: "Returns",
    lastUpdated: "2026-02-05",
    tags: ["return", "refund", "exchange", "30-day", "policy", "restocking", "condition"],
    content: `We stand by our products with a hassle-free 30-day return policy from the delivery date.
Eligible items must be returned in original packaging with all included accessories and serial tags intact.
Refunds are credited to the original payment method within 3 to 5 business days after our distribution center receives and inspects the unit.
Restocking fees: $0 restocking fee for defective units or mistaken shipments. A standard $5.99 return shipping fee applies to voluntary returns unless the customer is a Pro or Enterprise member.
To initiate a return, request a Return Merchandise Authorization (RMA) via our AI support agent or self-service order portal.`
  },
  {
    id: "kb-103",
    title: "Hardware Limited Warranty & ResolveX Care+ Extended Coverage",
    category: "Warranty",
    lastUpdated: "2026-01-28",
    tags: ["warranty", "repair", "hardware", "serial", "replacement", "care-plus", "accidental"],
    content: `All flagship hardware products include a 2-year Manufacturer Limited Warranty covering defects in materials and assembly.
ResolveX Care+ extended plans add 1 additional year of hardware protection and accidental liquid/drop damage coverage (up to 2 claims per year with a flat $25 service fee).
Warranty service provides free repair or replacement with a factory-certified refurbished unit of equal or higher performance.
To submit a warranty claim, customers must provide a valid product serial number (e.g., WN-99812 or WN-44210) and proof of purchase.
Normal wear and cosmetic scratches are not covered under standard warranty, though battery replacement is covered if capacity drops below 80% within the warranty window.`
  },
  {
    id: "kb-104",
    title: "Account Security, Passwords, MFA & Identity Verification",
    category: "Security",
    lastUpdated: "2026-01-15",
    tags: ["account", "security", "password", "2fa", "mfa", "login", "totp", "reset"],
    content: `Customer security is our highest priority. Accounts enforce Multi-Factor Authentication (MFA) via Authenticator Apps (TOTP) or SMS verification codes.
If you forget your password, click "Forgot Password" on the login screen to receive a single-use reset link valid for 60 minutes.
If an account is locked due to 5 consecutive failed login attempts, wait 15 minutes or contact support to undergo identity verification.
ResolveX support agents will NEVER request your password, credit card CVV code, or MFA security tokens.
You can review active session devices and revoke suspicious tokens anytime in Account Settings > Security.`
  },
  {
    id: "kb-105",
    title: "Smart Hardware Troubleshooting, Factory Reset & Bluetooth Pairing",
    category: "Technical",
    lastUpdated: "2026-02-08",
    tags: ["troubleshooting", "bluetooth", "power", "factory-reset", "firmware", "pairing", "wifi"],
    content: `Troubleshooting guide for ResolveX Smart Home Security Hub and Audio devices:
1. Factory Reset: Hold the hardware Action button for 10 seconds until the LED turns solid amber, then release to clear configuration.
2. Bluetooth 5.3 Pairing: Hold the Bluetooth button for 3 seconds until the LED pulses blue rapidly. Open device settings on your smartphone and select 'ResolveX Device'.
3. Wi-Fi Re-connection: If offline, toggle 2.4GHz/5GHz band steering or reset router settings. Ensure WPA2/WPA3 security is enabled.
4. Firmware Over-The-Air (OTA): Pushed automatically at 3:00 AM local time when connected to Wi-Fi and power.`
  },
  {
    id: "kb-106",
    title: "Subscription Plans, Recurring Billing, Taxes & Invoices",
    category: "Billing",
    lastUpdated: "2026-01-30",
    tags: ["subscription", "billing", "cancel", "membership", "invoice", "pro", "enterprise", "tax"],
    content: `ResolveX offers flexible billing tiers: Basic Free ($0/mo), Pro ($14.99/mo or $149/yr), and Enterprise ($49.99/mo or $499/yr).
Subscriptions auto-renew on your monthly or annual billing anniversary date using your saved default card.
PDF invoices with itemized VAT/Sales Tax breakdown are generated instantly and accessible under Account > Billing History.
Upgrades take effect immediately with prorated billing, while downgrades take effect at the conclusion of the current paid billing term.
Mid-cycle cancellations retain account benefits until period end without immediate penalty fees.`
  },
  {
    id: "kb-107",
    title: "Order Cancellation Policy & Unfulfilled Order Modification",
    category: "Shipping",
    lastUpdated: "2026-02-04",
    tags: ["cancel", "order-cancel", "modify-order", "fulfillment", "warehouse", "address-change"],
    content: `Orders can be cancelled or modified for a 100% full refund only while in the 'Processing' status prior to warehouse packing.
Once an order transitions to 'In Transit' or 'Packed', it cannot be cancelled in flight; however, you may initiate a return upon receipt or refuse package delivery.
Address changes can be requested within 2 hours of placing an order via the MCP Order Management tool or live agent.
To request immediate cancellation, provide your Order ID (e.g., ORD-8921 or ORD-3309) to the AI assistant.`
  },
  {
    id: "kb-108",
    title: "Developer REST API Keys, Webhooks & Rate Limits",
    category: "Technical",
    lastUpdated: "2026-02-06",
    tags: ["api", "developer", "webhook", "api-key", "token", "rate-limit", "sdk", "oauth"],
    content: `ResolveX exposes REST and GraphQL APIs for enterprise system integrations and real-time telemetry streaming.
API Access Keys can be generated via the MCP Developer Tool or Developer Console under Settings > Developer Keys.
Rate limits: Standard accounts receive 1,000 requests/hour; Pro accounts receive 10,000 requests/hour; Enterprise accounts receive unlimited requests.
Webhooks support HMAC SHA-256 signatures for signature validation on events like 'order.shipped', 'ticket.created', and 'device.telemetry'.
Keep your API secrets confidential. Compromised keys can be revoked and re-generated instantly.`
  },
  {
    id: "kb-109",
    title: "Enterprise SLA Guarantees, 99.9% Uptime & Priority Support",
    category: "Billing",
    lastUpdated: "2026-01-22",
    tags: ["sla", "uptime", "enterprise", "priority", "escalation", "dedicated", "support-tier"],
    content: `Enterprise tier customers are protected by a 99.9% Service Level Agreement (SLA) covering cloud API availability and Smart Hub infrastructure.
If monthly uptime drops below 99.9%, customers are eligible for service SLA credits ranging from 10% to 50% of their monthly contract value.
Enterprise customers receive 24/7/365 priority phone & chat support with a guaranteed 15-minute initial response window.
Dedicated Technical Account Managers (TAM) are assigned to Enterprise accounts with quarterly operational reviews.`
  },
  {
    id: "kb-110",
    title: "GDPR & CCPA Data Privacy Rights, Export & Account Deletion",
    category: "Security",
    lastUpdated: "2026-01-19",
    tags: ["gdpr", "ccpa", "privacy", "data-export", "delete-account", "compliance", "data-retention"],
    content: `ResolveX complies fully with EU General Data Protection Regulation (GDPR) and California Consumer Privacy Act (CCPA).
Users have the Right to Access, Right to Portability (Data Export), and Right to be Forgotten (Account Erasure).
You can download a complete ZIP archive of your telemetry, billing records, and support interactions using our MCP Data Export tool.
Account deletion requests process within 30 days. Certain transaction records are retained for legally required tax audit periods.`
  },
  {
    id: "kb-111",
    title: "On-Site Hardware Technician Dispatch & Field Service",
    category: "Technical",
    lastUpdated: "2026-02-07",
    tags: ["technician", "on-site", "field-service", "repair", "installation", "dispatch", "hardware"],
    content: `For complex enterprise hardware installations or severe device failures, ResolveX offers On-Site Certified Field Technician Dispatch.
Pro and Enterprise members receive priority scheduling within 24 to 48 business hours.
Technicians handle hardware diagnostic tests, physical wiring repairs, wall-mounting, and hub network integration.
Scheduling can be requested via our MCP Field Technician tool or by opening an urgent support ticket.`
  },
  {
    id: "kb-112",
    title: "Hardware Trade-In & E-Waste Environmental Recycling Program",
    category: "Returns",
    lastUpdated: "2026-01-12",
    tags: ["trade-in", "recycling", "e-waste", "credit", "eco-friendly", "upgrade", "discount"],
    content: `Trade in your legacy audio gear or Smart Hub v1 to receive up to $75 in store credit towards flagship ResolveX devices.
We partner with certified zero-landfill e-waste recyclers to ensure responsible disposal of lithium-ion batteries and circuit boards.
To request a prepaid eco-shipping label, select 'Trade-In / Recycle' in your account portal.
Trade-in credits are issued within 3 business days of device inspection.`
  },
  {
    id: "kb-113",
    title: "International Freight Shipping & Customs Duty Tariffs",
    category: "Shipping",
    lastUpdated: "2026-01-25",
    tags: ["tariffs", "customs", "duties", "freight", "international", "vat", "import-tax"],
    content: `All international orders ship Delivered Duty Paid (DDP) for eligible countries, meaning import taxes and customs duties are calculated at checkout.
For non-DDP countries, local postal authorities or DHL customs clearance agents may contact the receiver to collect customs duties before final delivery.
ResolveX cannot refund customs duties paid to local tax authorities for returned items unless required by local law.`
  },
  {
    id: "kb-114",
    title: "Smart Home Ecosystem Compatibility (Matter, HomeKit, Alexa, Google)",
    category: "Technical",
    lastUpdated: "2026-02-03",
    tags: ["matter", "homekit", "alexa", "google-home", "smart-home", "zigbee", "zwave"],
    content: `ResolveX Smart Home Security Hub v2 natively supports the Matter protocol over Thread, Apple HomeKit, Amazon Alexa, and Google Home ecosystems.
To link with Apple HomeKit, scan the 8-digit setup code printed on the bottom of your Smart Hub unit.
To integrate with Alexa or Google Assistant, enable the 'ResolveX Smart Home' skill in the respective smartphone app.`
  },
  {
    id: "kb-115",
    title: "Payment Methods, Apple Pay, PayPal & Failed Payment Retries",
    category: "Billing",
    lastUpdated: "2026-01-18",
    tags: ["payment", "apple-pay", "paypal", "credit-card", "declined", "billing-retry"],
    content: `We accept Visa, Mastercard, American Express, Discover, Apple Pay, Google Pay, and PayPal.
If a subscription renewal payment is declined, our automated billing engine will retry charging the card on day 3, day 7, and day 14.
During this 14-day grace period, subscription features remain active. On day 15, uncollected accounts revert to Basic Free tier.`
  },
  {
    id: "kb-116",
    title: "Firmware Recovery Mode & USB Flash Flashing Manual",
    category: "Technical",
    lastUpdated: "2026-02-02",
    tags: ["firmware-recovery", "bootloop", "unbrick", "usb-flashing", "bootloader", "manual-update"],
    content: `If your device becomes unresponsive or experiences a bootloop after a power outage, use Emergency USB Recovery:
1. Download official recovery BIN image from resolvex.ai/firmware.
2. Format a USB drive to FAT32 and copy the recovery file `resolvex_fw.bin` to root directory.
3. Insert USB drive into rear USB port, hold Power + Mute buttons for 15 seconds until LED glows solid purple.
4. The hub will automatically reflash and reboot within 4 minutes.`
  },
  {
    id: "kb-117",
    title: "Order Stolen or Damaged in Transit Insurance Claims",
    category: "Shipping",
    lastUpdated: "2026-01-29",
    tags: ["damaged-package", "stolen", "insurance", "claim", "replacement", "courier-claim"],
    content: `All shipments include complimentary ResolveX Transit Insurance protecting against theft, loss, or transit damage.
If your package arrives physically crushed or items are missing:
1. Photograph the external shipping box and damaged items.
2. Report the incident to ResolveX support within 5 calendar days of marked delivery date.
3. An immediate replacement order will be dispatched with expedited 1-day shipping.`
  },
  {
    id: "kb-118",
    title: "AI Model Guardrails, Data Privacy & Training Consent Policy",
    category: "Security",
    lastUpdated: "2026-02-09",
    tags: ["ai-privacy", "guardrails", "data-retention", "training-consent", "llm", "security-policy"],
    content: `ResolveX AI Support Agent operates on strict enterprise privacy principles:
- Customer chat logs and database queries are NEVER used to train public LLM foundation models.
- All session metadata is encrypted at rest using AES-256 and in transit via TLS 1.3.
- Personal Identifiable Information (PII) like credit cards and passwords are automatically redacted by our MCP proxy layer.`
  },
  {
    id: "kb-119",
    title: "VIP Concierge Program & Personal Account Management",
    category: "Billing",
    lastUpdated: "2026-01-14",
    tags: ["vip", "concierge", "account-manager", "perks", "priority", "executive"],
    content: `Customers spending over $2,500 annually or subscribing to Enterprise tier automatically receive VIP Concierge status.
VIP perks include:
- Direct access to Senior Support Engineers via dedicated VIP Hotline.
- Free overnight shipping on all orders regardless of cart total.
- Pre-release access to new hardware hardware beta programs and annual trade-in credits.`
  },
  {
    id: "kb-120",
    title: "Battery Health Management & Charging Temperature Limits",
    category: "Technical",
    lastUpdated: "2026-02-04",
    tags: ["battery", "charging", "temperature", "overheating", "fast-charge", "degradation"],
    content: `ResolveX devices utilize high-density Lithium-Polymer battery cells with Smart Thermal Protection.
Fast charging (0 to 80% in 35 minutes) operates safely between 5°C and 45°C (41°F to 113°F).
If internal battery temperature exceeds 50°C, charging automatically throttles to standard speed to protect cell longevity.
Avoid leaving wireless headphones charging in direct sunlight inside parked vehicles.`
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { INITIAL_KNOWLEDGE_BASE };
}
