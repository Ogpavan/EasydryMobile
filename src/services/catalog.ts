import type { Plan, ServiceId } from "../types";
export const services: {
  id: ServiceId;
  name: string;
  subtitle: string;
  description: string;
  price: string;
  turnaround: string;
}[] = [
  {
    id: "dry",
    name: "Dry Clean",
    subtitle: "For delicate clothes",
    description: "Careful cleaning for delicate clothes and special wear.",
    price: "₹149 / item",
    turnaround: "72 hours",
  },
  {
    id: "fold",
    name: "Wash",
    subtitle: "Wash and fold",
    description: "Everyday clothes, washed and folded.",
    price: "₹79 / kg",
    turnaround: "48 hours",
  },
  {
    id: "rafu",
    name: "Rafu",
    subtitle: "Clothing repair",
    description: "Repair small tears, holes and worn fabric.",
    price: "₹79 / item",
    turnaround: "48 hours",
  },
  {
    id: "iron",
    name: "Iron",
    subtitle: "Pressed and ready to wear",
    description: "Clothes pressed and ready to wear.",
    price: "₹45 / item",
    turnaround: "48 hours",
  },
];
export const slots = [
  "9:00 AM – 11:00 AM",
  "11:00 AM – 1:00 PM",
  "2:00 PM – 4:00 PM",
  "4:00 PM – 6:00 PM",
  "6:00 PM – 8:00 PM",
];
export const plans: Plan[] = [
  {
    id: "essential",
    name: "Everyday Essential",
    price: 1000,
    credit: 1100,
    bonus: 10,
    benefits: [
      "₹1,100 in laundry credit",
      "All four services included",
      "Credit never expires",
    ],
  },
  {
    id: "plus",
    name: "Fresh Start Plus",
    price: 2500,
    credit: 2875,
    bonus: 15,
    benefits: [
      "₹2,875 in laundry credit",
      "All four services included",
      "Priority pickup support",
      "Credit never expires",
    ],
  },
  {
    id: "family",
    name: "The Family Plan",
    price: 5000,
    credit: 6000,
    bonus: 20,
    benefits: [
      "₹6,000 in laundry credit",
      "Great for the whole household",
      "Priority pickup support",
      "Credit never expires",
    ],
  },
];
export const coupons = [
  {
    code: "FRESH20",
    title: "A fresh start, for less.",
    description: "20% off an unpaid invoice of ₹300 or more. Up to ₹150.",
    min: 300,
    percent: 20,
    max: 150,
    expires: "2027-12-31",
  },
  {
    code: "WEEKEND10",
    title: "Your weekend, reclaimed.",
    description: "10% off invoices of ₹500 or more. Up to ₹100.",
    min: 500,
    percent: 10,
    max: 100,
    expires: "2027-12-31",
  },
  {
    code: "HELLO2025",
    title: "Welcome offer",
    description: "This campaign has ended.",
    min: 0,
    percent: 15,
    max: 100,
    expires: "2025-12-31",
  },
];
export const serviceNames = (ids: ServiceId[]) =>
  ids
    .map(
      (id) =>
        services.find((s) => s.id === id)?.name ??
        (id === "shoe" ? "Shoe Care" : id),
    )
    .join(" · ");
