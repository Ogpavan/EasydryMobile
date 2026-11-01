import { Suspense, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { BottomNavigation, Brand } from "../components/navigation/Navigation";
import { LoadingSkeleton } from "../components/common/ui";
import { Leaf, ShieldCheck } from "lucide-react";
export function AppShell() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    document.querySelector(".app-scroll")?.scrollTo({ top: 0 });
  }, [pathname]);
  return (
    <div className="desktop-stage">
      <aside className="desktop-brand">
        <Brand large />
        <p>
          A little less laundry.
          <br />
          <strong>A little more life.</strong>
        </p>
        <div>
          <ShieldCheck size={16} />
          Thoughtful care, from pickup to doorstep.
        </div>
        <span className="desktop-demo">CUSTOMER APP · DEMO EXPERIENCE</span>
      </aside>
      <div className="app-shell">
        <div className="app-scroll">
          <Suspense
            fallback={
              <div className="page">
                <LoadingSkeleton />
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </div>
      </div>
      <div className="desktop-footnote">
        <Leaf size={15} />
        <span>Made for the way you live.</span>
      </div>
    </div>
  );
}
export function AppLayout() {
  return (
    <>
      <Outlet />
      <BottomNavigation />
    </>
  );
}
export function BookingLayout() {
  return (
    <div className="focused-flow">
      <Outlet />
    </div>
  );
}
export function AuthLayout() {
  return (
    <div className="auth-layout">
      <Outlet />
    </div>
  );
}
