import {
  createBrowserRouter,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";
import {
  AppLayout,
  AppShell,
  AuthLayout,
  BookingLayout,
} from "../layouts/AppLayout";
import { useAppStore } from "../store/appStore";
import { Login, Onboarding, OTP, Splash } from "../features/auth/Auth";
import { lazy } from "react";
import { EmptyState } from "../components/common/ui";
const Home = lazy(() => import("../features/home/Home"));
const Addresses = lazy(() => import("../features/booking/Addresses"));
const Packages = lazy(() => import("../features/packages/Packages"));
const Offers = lazy(() => import("../features/offers/Offers"));
const Support = lazy(() => import("../features/support/Support"));
const PickupConfirmation = lazy(() =>
  import("../features/booking/Booking").then((m) => ({
    default: m.PickupConfirmation,
  })),
);
const SchedulePickup = lazy(() =>
  import("../features/booking/Booking").then((m) => ({
    default: m.SchedulePickup,
  })),
);
const SelectService = lazy(() =>
  import("../features/booking/Booking").then((m) => ({
    default: m.SelectService,
  })),
);
const CancelPickup = lazy(() =>
  import("../features/requests/Requests").then((m) => ({
    default: m.CancelPickup,
  })),
);
const RequestDetails = lazy(() =>
  import("../features/requests/Requests").then((m) => ({
    default: m.RequestDetails,
  })),
);
const Requests = lazy(() =>
  import("../features/requests/Requests").then((m) => ({
    default: m.Requests,
  })),
);
const Reschedule = lazy(() =>
  import("../features/requests/Requests").then((m) => ({
    default: m.Reschedule,
  })),
);
const Delivered = lazy(() =>
  import("../features/orders/Orders").then((m) => ({ default: m.Delivered })),
);
const OrderDetails = lazy(() =>
  import("../features/orders/Orders").then((m) => ({
    default: m.OrderDetails,
  })),
);
const Orders = lazy(() =>
  import("../features/orders/Orders").then((m) => ({ default: m.Orders })),
);
const Tracking = lazy(() =>
  import("../features/orders/Orders").then((m) => ({ default: m.Tracking })),
);
const PaymentMethods = lazy(() =>
  import("../features/profile/Profile").then((m) => ({
    default: m.PaymentMethods,
  })),
);
const Profile = lazy(() =>
  import("../features/profile/Profile").then((m) => ({ default: m.Profile })),
);
const Legal = lazy(() =>
  import("../features/settings/Settings").then((m) => ({ default: m.Legal })),
);
const Notifications = lazy(() =>
  import("../features/settings/Settings").then((m) => ({
    default: m.Notifications,
  })),
);
const Settings = lazy(() =>
  import("../features/settings/Settings").then((m) => ({
    default: m.Settings,
  })),
);
function Protected() {
  const authenticated = useAppStore((s) => s.authenticated);
  return authenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
function OtpRoute() {
  const location = useLocation();
  const phone = location.state?.phone as string | undefined;
  return phone ? <OTP phone={phone} /> : <Navigate to="/login" replace />;
}
export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { index: true, element: <Splash /> },
      {
        element: <AuthLayout />,
        children: [
          { path: "onboarding", element: <Onboarding /> },
          { path: "login", element: <Login /> },
          { path: "verify", element: <OtpRoute /> },
        ],
      },
      { path: "legal/:type", element: <Legal /> },
      {
        element: <Protected />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { path: "home", element: <Home /> },
              { path: "requests", element: <Requests /> },
              { path: "orders", element: <Orders /> },
              { path: "account", element: <Profile /> },
            ],
          },
          {
            element: <BookingLayout />,
            children: [
              { path: "booking/services", element: <SelectService /> },
              { path: "booking/schedule", element: <SchedulePickup /> },
              { path: "booking/address", element: <Addresses booking /> },
              {
                path: "booking/confirmed/:id",
                element: <PickupConfirmation />,
              },
            ],
          },
          { path: "requests/:id", element: <RequestDetails /> },
          { path: "requests/:id/reschedule", element: <Reschedule /> },
          { path: "requests/:id/cancel", element: <CancelPickup /> },
          { path: "orders/:id", element: <OrderDetails /> },
          { path: "orders/:id/tracking", element: <Tracking /> },
          { path: "orders/:id/delivered", element: <Delivered /> },
          { path: "packages", element: <Packages /> },
          { path: "offers", element: <Offers /> },
          { path: "addresses", element: <Addresses /> },
          { path: "payment-methods", element: <PaymentMethods /> },
          { path: "support", element: <Support /> },
          { path: "settings", element: <Settings /> },
          { path: "notifications", element: <Notifications /> },
        ],
      },
      {
        path: "*",
        element: (
          <main className="page">
            <EmptyState
              title="A little off track"
              description="Let’s get you back to fresh."
              action="Back to home"
              to="/home"
            />
          </main>
        ),
      },
    ],
  },
]);
