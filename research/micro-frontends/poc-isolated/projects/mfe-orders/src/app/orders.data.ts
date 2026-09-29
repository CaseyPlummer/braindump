export interface OrderLine {
  sku: string;
  name: string;
  qty: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  placed: string; // ISO date
  lines: OrderLine[];
}

export const ORDERS: readonly Order[] = [
  {
    id: "1001",
    placed: "2026-08-02",
    lines: [
      { sku: "SKU-100", name: "Desk lamp", qty: 1, unitPrice: 49.5 },
      { sku: "SKU-101", name: "Bulb (2-pack)", qty: 2, unitPrice: 6.25 },
    ],
  },
  {
    id: "1002",
    placed: "2026-08-19",
    lines: [{ sku: "SKU-200", name: "Office chair", qty: 1, unitPrice: 289 }],
  },
  {
    id: "1003",
    placed: "2026-09-11",
    lines: [
      { sku: "SKU-300", name: "Notebook", qty: 5, unitPrice: 3.2 },
      { sku: "SKU-301", name: "Gel pens (10)", qty: 1, unitPrice: 8.9 },
    ],
  },
];

export function orderTotal(order: Order): number {
  return order.lines.reduce((sum, l) => sum + l.qty * l.unitPrice, 0);
}

/** Runtime locale switching uses Intl; Angular's LOCALE_ID is fixed per application. */
export function formatMoney(
  locale: string | undefined,
  amount: number,
): string {
  return new Intl.NumberFormat(locale ?? "en-US", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export function formatDate(locale: string | undefined, iso: string): string {
  return new Intl.DateTimeFormat(locale ?? "en-US", {
    dateStyle: "medium",
    timeZone: "UTC", // ISO dates parse as UTC midnight
  }).format(new Date(iso));
}
