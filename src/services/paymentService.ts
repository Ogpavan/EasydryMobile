import { mockApi } from "./mockApi";
import { useAppStore } from "../store/appStore";
export const paymentService = {
  pay: (id: string, method: string, fail: boolean) =>
    mockApi(() => useAppStore.getState().pay(id, method, fail), 1000),
  activate: (id: string, method: string, fail: boolean) =>
    mockApi(() => useAppStore.getState().activatePlan(id, method, fail), 1000),
};
