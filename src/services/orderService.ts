import type { LineItem, Order, PickupRequest } from "../types";
import { uid } from "../utils/format";
export const subtotal = (order: Order) =>
  order.items.reduce((sum, i) => sum + i.quantity * i.price, 0) +
  order.expressFee;
export const total = (order: Order) =>
  Math.max(0, subtotal(order) - order.discount - order.packageCredit);
export const assessRequest = (request: PickupRequest): Order => ({
  id: uid("ED"),
  requestId: request.id,
  services: request.services,
  stage: "collected",
  createdAt: new Date().toISOString(),
  paid: false,
  discount: 0,
  packageCredit: 0,
  expressFee: request.express ? 99 : 0,
  items: request.services.flatMap<LineItem>((service) =>
    service === "fold"
      ? [{ name: "Everyday laundry (kg)", quantity: 3, price: 79, unit: "kg" }]
      : service === "iron"
        ? [
            { name: "Shirt — iron", quantity: 3, price: 45 },
            { name: "Trousers — iron", quantity: 2, price: 60 },
          ]
        : service === "dry"
          ? [
              { name: "Blazer — dry clean", quantity: 1, price: 249 },
              { name: "Dress — dry clean", quantity: 1, price: 199 },
            ]
          : service === "rafu"
            ? [{ name: "Rafu repair", quantity: 1, price: 79 }]
            : [
              {
                name: "Sneakers — deep clean",
                quantity: 1,
                price: 299,
                unit: "pair",
              },
            ],
  ),
});
export const stages = [
  {
    id: "collected",
    label: "Pickup completed",
    description: "Your laundry is safely in our care.",
  },
  {
    id: "processing",
    label: "Cleaning in progress",
    description: "A little expert care for every fabric.",
  },
  {
    id: "ready",
    label: "Ready for delivery",
    description: "Fresh, checked and neatly packed.",
  },
  {
    id: "out",
    label: "Out for delivery",
    description: "Your fresh laundry is on its way.",
  },
  {
    id: "delivered",
    label: "Delivered",
    description: "Fresh laundry. One less thing to do.",
  },
] as const;

export function itemSummary(order: Order) {
  const counts = { kg: 0, pair: 0, item: 0 };
  for (const item of order.items)
    counts[item.unit ?? (item.name.includes("(kg)") ? "kg" : "item")] +=
      item.quantity;
  return [
    counts.kg ? `${counts.kg} kg` : "",
    counts.pair ? `${counts.pair} pair${counts.pair > 1 ? "s" : ""}` : "",
    counts.item ? `${counts.item} article${counts.item > 1 ? "s" : ""}` : "",
  ]
    .filter(Boolean)
    .join(" · ");
}
