import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  ActivePlan,
  Address,
  BookingDraft,
  Order,
  OrderStage,
  Payment,
  PickupRequest,
  Profile,
  Ticket,
} from "../types";
import { nextDates, today, uid } from "../utils/format";
import {
  assessRequest,
  subtotal,
  total,
  stages,
} from "../services/orderService";
import { coupons, plans, slots } from "../services/catalog";
const initialDraft = (): BookingDraft => ({
  services: [],
  date: "",
  slot: "",
  express: false,
  addressId: "home",
});
const addresses: Address[] = [
  {
    id: "home",
    label: "Home",
    contact: "9876543210",
    street: "24, Green Park Apartments",
    area: "Indiranagar",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560038",
  },
  {
    id: "work",
    label: "Work",
    contact: "9876543210",
    street: "8, Embassy Tech Village",
    area: "Bellandur",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560103",
  },
];
const demoRequest: PickupRequest = {
  id: "PU-2048",
  services: ["fold", "iron"],
  date: nextDates()[0],
  slot: slots[1],
  express: false,
  addressId: "home",
  address: addresses[0],
  status: "scheduled",
  createdAt: new Date().toISOString(),
};
const demoOrder: Order = {
  id: "ED-1024",
  requestId: "PU-2039",
  services: ["iron", "dry"],
  stage: "processing",
  createdAt: new Date().toISOString(),
  items: [
    { name: "Shirt — iron", quantity: 4, price: 45 },
    { name: "Trousers — iron", quantity: 2, price: 60 },
    { name: "Blazer — dry clean", quantity: 1, price: 249 },
  ],
  expressFee: 0,
  paid: false,
  discount: 0,
  packageCredit: 0,
};
interface AppState {
  onboarded: boolean;
  authenticated: boolean;
  profile: Profile;
  addresses: Address[];
  preferredAddressId: string;
  draft: BookingDraft;
  requests: PickupRequest[];
  orders: Order[];
  payments: Payment[];
  activePlan: ActivePlan | null;
  appliedCoupon: string;
  notifications: { orders: boolean; offers: boolean };
  language: string;
  tickets: Ticket[];
  completeOnboarding: () => void;
  login: (phone: string) => void;
  logout: () => void;
  updateProfile: (p: Profile) => void;
  updateDraft: (d: Partial<BookingDraft>) => void;
  addAddress: (a: Address) => void;
  deleteAddress: (id: string) => void;
  setPreferredAddress: (id: string) => void;
  confirmBooking: () => string;
  reschedule: (id: string, date: string, slot: string) => void;
  cancelRequest: (id: string, reason: string, notes: string) => void;
  assess: (id: string) => string;
  advanceOrder: (id: string) => void;
  applyCoupon: (code: string, orderId?: string) => void;
  pay: (id: string, method: string, fail?: boolean) => void;
  activatePlan: (id: string, method: string, fail?: boolean) => void;
  redeem: (id: string) => void;
  rate: (id: string, rating: number) => void;
  setNotifications: (p: Partial<AppState["notifications"]>) => void;
  setLanguage: (value: string) => void;
  createTicket: (ticket: Omit<Ticket, "id" | "createdAt">) => string;
}
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      onboarded: false,
      authenticated: false,
      profile: { name: "Alex", phone: "", email: "" },
      addresses,
      preferredAddressId: "home",
      draft: initialDraft(),
      requests: [demoRequest],
      orders: [
        demoOrder,
        {
          ...demoOrder,
          id: "ED-0982",
          requestId: "PU-1981",
          stage: "delivered",
          paid: true,
          createdAt: new Date(Date.now() - 604800000).toISOString(),
          rating: 5,
        },
      ],
      payments: [],
      activePlan: null,
      appliedCoupon: "",
      notifications: { orders: true, offers: false },
      language: "English",
      tickets: [],
      completeOnboarding: () => set({ onboarded: true }),
      login: (phone) =>
        set((s) => ({ authenticated: true, profile: { ...s.profile, phone } })),
      logout: () =>
        set({
          authenticated: false,
          draft: { ...initialDraft(), addressId: get().preferredAddressId },
          appliedCoupon: "",
        }),
      updateProfile: (profile) => set({ profile }),
      updateDraft: (d) => set((s) => ({ draft: { ...s.draft, ...d } })),
      addAddress: (a) =>
        set((s) => ({
          addresses: s.addresses.some((x) => x.id === a.id)
            ? s.addresses.map((x) => (x.id === a.id ? a : x))
            : [...s.addresses, a],
        })),
      setPreferredAddress: (id) => {
        if (!get().addresses.some((a) => a.id === id)) return;
        set((s) => ({
          preferredAddressId: id,
          draft: { ...s.draft, addressId: id },
        }));
      },
      deleteAddress: (id) =>
        set((s) => ({
          addresses: s.addresses.filter((a) => a.id !== id),
          preferredAddressId:
            s.preferredAddressId === id
              ? (s.addresses.find((a) => a.id !== id)?.id ?? "")
              : s.preferredAddressId,
          draft: {
            ...s.draft,
            addressId: s.draft.addressId === id ? "" : s.draft.addressId,
          },
        })),
      confirmBooking: () => {
        const s = get(),
          d = s.draft,
          a = s.addresses.find((x) => x.id === d.addressId);
        if (
          !a ||
          !d.services.length ||
          !nextDates().includes(d.date) ||
          !slots.includes(d.slot)
        )
          throw new Error(
            "Choose services, an available date, time and address.",
          );
        const id = uid("PU");
        set({
          requests: [
            {
              ...d,
              id,
              address: { ...a },
              status: "scheduled",
              createdAt: new Date().toISOString(),
            },
            ...s.requests,
          ],
          draft: { ...initialDraft(), addressId: s.preferredAddressId },
        });
        return id;
      },
      reschedule: (id, date, slot) => {
        const r = get().requests.find((x) => x.id === id);
        if (r?.status !== "scheduled")
          throw new Error("This pickup can no longer be rescheduled.");
        if (!nextDates().includes(date) || !slots.includes(slot))
          throw new Error("Choose an available date and time.");
        set((s) => ({
          requests: s.requests.map((x) =>
            x.id === id ? { ...x, date, slot } : x,
          ),
        }));
      },
      cancelRequest: (id, reason, notes) => {
        if (get().requests.find((x) => x.id === id)?.status !== "scheduled")
          throw new Error("Only upcoming pickups can be cancelled.");
        if (!reason) throw new Error("Select a cancellation reason.");
        set((s) => ({
          requests: s.requests.map((x) =>
            x.id === id
              ? {
                  ...x,
                  status: "cancelled",
                  cancelReason: reason,
                  cancelNotes: notes,
                }
              : x,
          ),
        }));
      },
      assess: (id) => {
        const s = get(),
          r = s.requests.find((x) => x.id === id);
        const existing = s.orders.find((x) => x.requestId === id);
        if (existing) return existing.id;
        if (!r || r.status !== "scheduled")
          throw new Error("This request is not available for collection.");
        const order = assessRequest(r);
        set({
          requests: s.requests.map((x) =>
            x.id === id ? { ...x, status: "collected" } : x,
          ),
          orders: [order, ...s.orders],
        });
        if (s.appliedCoupon) {
          try {
            get().applyCoupon(s.appliedCoupon, order.id);
          } catch {
            /* Pending coupon stays available if the assessed invoice is ineligible. */
          }
        }
        return order.id;
      },
      advanceOrder: (id) => {
        const o = get().orders.find((x) => x.id === id);
        if (!o) throw new Error("Order not found.");
        const index = stages.findIndex((x) => x.id === o.stage);
        if (index === 4) return;
        if (index === 3 && !o.paid)
          throw new Error("Complete the demo payment before delivery.");
        set((s) => ({
          orders: s.orders.map((x) =>
            x.id === id
              ? { ...x, stage: stages[index + 1].id as OrderStage }
              : x,
          ),
        }));
      },
      applyCoupon: (code, orderId) => {
        const c = coupons.find((x) => x.code === code.toUpperCase());
        if (!c) throw new Error("This coupon code is not valid.");
        if (c.expires < today()) throw new Error("This offer has expired.");
        if (orderId) {
          const o = get().orders.find((x) => x.id === orderId);
          if (!o || o.paid) throw new Error("Choose an unpaid invoice.");
          if (o.packageCredit > 0)
            throw new Error(
              "A coupon cannot be changed after package credit is used.",
            );
          if (subtotal(o) < c.min)
            throw new Error(`This offer needs a minimum invoice of ₹${c.min}.`);
          set((s) => ({
            orders: s.orders.map((x) =>
              x.id === orderId
                ? {
                    ...x,
                    coupon: c.code,
                    discount: Math.min(
                      c.max,
                      Math.round((subtotal(o) * c.percent) / 100),
                    ),
                  }
                : x,
            ),
            appliedCoupon: c.code,
          }));
        } else set({ appliedCoupon: c.code });
      },
      pay: (id, method, fail = false) => {
        const o = get().orders.find((x) => x.id === id);
        if (!o || o.paid)
          throw new Error("This invoice has already been settled.");
        const payment: Payment = {
          id: uid("PAY"),
          orderId: id,
          amount: total(o),
          method,
          status: fail ? "failed" : "success",
          createdAt: new Date().toISOString(),
          purpose: `Invoice ${id}`,
        };
        set((s) => ({
          payments: [payment, ...s.payments],
          orders: fail
            ? s.orders
            : s.orders.map((x) => (x.id === id ? { ...x, paid: true } : x)),
        }));
        if (fail)
          throw new Error(
            "Demo payment declined. No money was charged. Please try again.",
          );
      },
      activatePlan: (id, method, fail = false) => {
        const p = plans.find((x) => x.id === id);
        if (!p) throw new Error("Plan unavailable.");
        const payment: Payment = {
          id: uid("PAY"),
          amount: p.price,
          method,
          status: fail ? "failed" : "success",
          createdAt: new Date().toISOString(),
          purpose: p.name,
        };
        set((s) => ({
          payments: [payment, ...s.payments],
          activePlan: fail
            ? s.activePlan
            : {
                planId: p.id,
                name: p.name,
                balance: (s.activePlan?.balance ?? 0) + p.credit,
                activatedAt: new Date().toISOString(),
              },
        }));
        if (fail)
          throw new Error(
            "Demo payment declined. Your balance has not changed.",
          );
      },
      redeem: (id) => {
        const s = get(),
          o = s.orders.find((x) => x.id === id);
        if (!o || o.paid || !s.activePlan || s.activePlan.balance <= 0)
          throw new Error("No package credit available for this invoice.");
        const credit = Math.min(total(o), s.activePlan.balance);
        set({
          activePlan: {
            ...s.activePlan,
            balance: s.activePlan.balance - credit,
          },
          orders: s.orders.map((x) =>
            x.id === id
              ? {
                  ...x,
                  packageCredit: x.packageCredit + credit,
                  paid: credit >= total(o),
                }
              : x,
          ),
        });
      },
      rate: (id, rating) => {
        if (
          get().orders.find((o) => o.id === id)?.stage !== "delivered" ||
          !Number.isInteger(rating) ||
          rating < 1 ||
          rating > 5
        )
          return;
        set((s) => ({
          orders: s.orders.map((x) => (x.id === id ? { ...x, rating } : x)),
        }));
      },
      setNotifications: (p) =>
        set((s) => ({ notifications: { ...s.notifications, ...p } })),
      setLanguage: (language) => set({ language }),
      createTicket: (t) => {
        const id = uid("HELP");
        set((s) => ({
          tickets: [
            { ...t, id, createdAt: new Date().toISOString() },
            ...s.tickets,
          ],
        }));
        return id;
      },
    }),
    { name: "easydry-demo-v1", version: 1 },
  ),
);
