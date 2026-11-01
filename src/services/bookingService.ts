import { useAppStore } from "../store/appStore";
import { mockApi } from "./mockApi";
export const bookingService = {
  confirm: () => mockApi(() => useAppStore.getState().confirmBooking()),
  reschedule: (id: string, date: string, slot: string) =>
    mockApi(() => useAppStore.getState().reschedule(id, date, slot)),
  cancel: (id: string, reason: string, notes: string) =>
    mockApi(() => useAppStore.getState().cancelRequest(id, reason, notes)),
  assess: (id: string) => mockApi(() => useAppStore.getState().assess(id), 800),
};
