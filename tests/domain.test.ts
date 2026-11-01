import { beforeEach, describe, expect, it, vi } from "vitest";
const memory = new Map<string, string>();
vi.stubGlobal("localStorage", {
  getItem: (key: string) => memory.get(key) ?? null,
  setItem: (key: string, value: string) => memory.set(key, value),
  removeItem: (key: string) => memory.delete(key),
});
const { useAppStore } = await import("../src/store/appStore");
const { total, subtotal } = await import("../src/services/orderService");
const { nextDates } = await import("../src/utils/format");
const { slots } = await import("../src/services/catalog");
const initial = useAppStore.getState();
beforeEach(() => {
  useAppStore.setState(initial, true);
  memory.clear();
});
describe("pickup-first lifecycle", () => {
  it("creates only a request, then creates one invoice after assessment", () => {
    const s = useAppStore.getState();
    s.updateDraft({
      services: ["fold", "iron"],
      date: nextDates()[0],
      slot: slots[0],
      addressId: "home",
    });
    const originalOrders = s.orders.length;
    const id = s.confirmBooking();
    expect(useAppStore.getState().orders).toHaveLength(originalOrders);
    expect(useAppStore.getState().draft.services).toEqual([]);
    const orderId = s.assess(id);
    expect(useAppStore.getState().orders).toHaveLength(originalOrders + 1);
    expect(s.assess(id)).toBe(orderId);
    expect(useAppStore.getState().orders).toHaveLength(originalOrders + 1);
    expect(
      useAppStore.getState().requests.find((x) => x.id === id)?.status,
    ).toBe("collected");
    expect(() => s.cancelRequest(id, "plans changed", "")).toThrow();
    expect(() => s.reschedule(id, nextDates()[1], slots[1])).toThrow();
  });
  it("requires complete, available booking details", () => {
    expect(() => useAppStore.getState().confirmBooking()).toThrow();
    useAppStore.getState().updateDraft({
      services: ["fold"],
      date: "2020-01-01",
      slot: slots[0],
      addressId: "home",
    });
    expect(() => useAppStore.getState().confirmBooking()).toThrow();
  });
  it("keeps a snapshot of an address when saved addresses change", () => {
    const s = useAppStore.getState();
    s.updateDraft({ services: ["fold"], date: nextDates()[0], slot: slots[0] });
    const id = s.confirmBooking();
    s.addAddress({ ...s.addresses[0], street: "Changed street" });
    s.deleteAddress("home");
    expect(
      useAppStore.getState().requests.find((x) => x.id === id)?.address.street,
    ).toBe("24, Green Park Apartments");
  });
  it("reschedules and cancels eligible requests only", () => {
    const s = useAppStore.getState();
    s.reschedule("PU-2048", nextDates()[2], slots[2]);
    expect(useAppStore.getState().requests[0].date).toBe(nextDates()[2]);
    s.cancelRequest("PU-2048", "Plans changed", "Later");
    expect(useAppStore.getState().requests[0].status).toBe("cancelled");
    expect(() => s.assess("PU-2048")).toThrow();
  });
});
describe("invoice and payment invariants", () => {
  it("checks coupon expiry and invoice eligibility", () => {
    const s = useAppStore.getState();
    expect(() => s.applyCoupon("HELLO2025", "ED-1024")).toThrow("expired");
    expect(() => s.applyCoupon("INVALID")).toThrow("not valid");
    s.applyCoupon("FRESH20", "ED-1024");
    const o = useAppStore.getState().orders[0];
    expect(o.discount).toBe(110);
    expect(total(o)).toBe(439);
    expect(() => s.applyCoupon("FRESH20", "ED-0982")).toThrow("unpaid");
  });
  it("records failure without settling an invoice and prevents duplicate payments", () => {
    const s = useAppStore.getState();
    expect(() => s.pay("ED-1024", "UPI", true)).toThrow("declined");
    expect(useAppStore.getState().orders[0].paid).toBe(false);
    expect(useAppStore.getState().payments[0].status).toBe("failed");
    s.pay("ED-1024", "UPI");
    expect(useAppStore.getState().orders[0].paid).toBe(true);
    expect(() => s.pay("ED-1024", "UPI")).toThrow("settled");
    expect(useAppStore.getState().payments).toHaveLength(2);
  });
  it("deducts plan credit atomically, after coupons, and never below zero", () => {
    const s = useAppStore.getState();
    s.activatePlan("essential", "UPI");
    s.applyCoupon("FRESH20", "ED-1024");
    s.redeem("ED-1024");
    const state = useAppStore.getState();
    expect(state.activePlan?.balance).toBe(661);
    expect(state.orders[0].packageCredit).toBe(439);
    expect(total(state.orders[0])).toBe(0);
    expect(state.orders[0].paid).toBe(true);
    expect(() => s.redeem("ED-1024")).toThrow();
    expect(state.activePlan?.balance).toBe(661);
  });
  it("supports partial credit and blocks changing coupons after redemption", () => {
    const s = useAppStore.getState();
    s.activatePlan("essential", "UPI");
    useAppStore.setState({
      activePlan: { ...useAppStore.getState().activePlan!, balance: 100 },
    });
    s.redeem("ED-1024");
    expect(total(useAppStore.getState().orders[0])).toBe(449);
    expect(useAppStore.getState().orders[0].paid).toBe(false);
    expect(useAppStore.getState().activePlan?.balance).toBe(0);
    expect(() => s.applyCoupon("FRESH20", "ED-1024")).toThrow("package credit");
  });
  it("failed plan payments leave credit unchanged; recharges add balance", () => {
    const s = useAppStore.getState();
    expect(() => s.activatePlan("plus", "UPI", true)).toThrow("declined");
    expect(useAppStore.getState().activePlan).toBeNull();
    s.activatePlan("essential", "UPI");
    s.activatePlan("plus", "UPI");
    expect(useAppStore.getState().activePlan?.balance).toBe(3975);
  });
  it("requires settled invoices before delivery", () => {
    const s = useAppStore.getState();
    s.advanceOrder("ED-1024");
    s.advanceOrder("ED-1024");
    expect(useAppStore.getState().orders[0].stage).toBe("out");
    expect(() => s.advanceOrder("ED-1024")).toThrow("payment");
    s.pay("ED-1024", "UPI");
    s.advanceOrder("ED-1024");
    expect(useAppStore.getState().orders[0].stage).toBe("delivered");
  });
  it("includes express fees only after assessment", () => {
    const s = useAppStore.getState();
    s.updateDraft({
      services: ["fold"],
      date: nextDates()[0],
      slot: slots[0],
      express: true,
    });
    const id = s.confirmBooking();
    const orderId = s.assess(id);
    const order = useAppStore.getState().orders.find((x) => x.id === orderId)!;
    expect(order.expressFee).toBe(99);
    expect(subtotal(order)).toBe(336);
  });
});

describe("hotspot HTTP compatibility", () => {
  it("creates record IDs without the secure-context randomUUID API", async () => {
    const { uid } = await import("../src/utils/format");
    const originalCrypto = globalThis.crypto;
    vi.stubGlobal("crypto", {
      getRandomValues: originalCrypto.getRandomValues.bind(originalCrypto),
    });
    try {
      const first = uid("PU");
      expect(first).toMatch(/^PU-[A-F0-9]{8}$/);
      expect(uid("PU")).not.toBe(first);
    } finally {
      vi.stubGlobal("crypto", originalCrypto);
    }
  });
});
