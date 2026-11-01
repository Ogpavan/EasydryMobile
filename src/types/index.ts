export type ServiceId = "fold" | "iron" | "dry" | "rafu" | "shoe";
export interface Address {
  id: string;
  label: string;
  contact: string;
  street: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
}
export interface BookingDraft {
  services: ServiceId[];
  date: string;
  slot: string;
  express: boolean;
  addressId: string;
}
export interface PickupRequest extends BookingDraft {
  id: string;
  createdAt: string;
  status: "scheduled" | "collected" | "cancelled";
  address: Address;
  cancelReason?: string;
  cancelNotes?: string;
}
export interface LineItem {
  unit?: "kg" | "pair" | "item";
  name: string;
  quantity: number;
  price: number;
}
export type OrderStage =
  "collected" | "processing" | "ready" | "out" | "delivered";
export interface Order {
  id: string;
  requestId: string;
  services: ServiceId[];
  items: LineItem[];
  stage: OrderStage;
  createdAt: string;
  expressFee: number;
  paid: boolean;
  discount: number;
  coupon?: string;
  packageCredit: number;
  rating?: number;
}
export interface Payment {
  id: string;
  orderId?: string;
  amount: number;
  method: string;
  status: "success" | "failed";
  createdAt: string;
  purpose: string;
}
export interface Profile {
  name: string;
  phone: string;
  email: string;
}
export interface Plan {
  id: string;
  name: string;
  price: number;
  credit: number;
  bonus: number;
  benefits: string[];
}
export interface ActivePlan {
  planId: string;
  name: string;
  balance: number;
  activatedAt: string;
}
export interface Ticket {
  id: string;
  subject: string;
  message: string;
  reference: string;
  createdAt: string;
}
