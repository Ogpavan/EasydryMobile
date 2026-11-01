import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { Bell, ChevronRight, Globe, Info, ShieldCheck } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { TopAppBar, Brand } from "../../components/navigation/Navigation";
import { Intro, SectionHeader } from "../../components/common/ui";
import { useAppStore } from "../../store/appStore";
import { LogoutButton } from "../profile/Profile";
export function Settings() {
  const { notifications, setNotifications, language, setLanguage } =
    useAppStore();
  const [languageOpen, setLanguageOpen] = useState(false);
  const [about, setAbout] = useState(false);
  return (
    <>
      <TopAppBar title="Settings" />
      <main className="page">
        <Intro title="App settings">
          Manage updates and preferences.
        </Intro>
        <SectionHeader title="Notifications" />
        <div className="panel settings-list">
          <div>
            <Bell size={20} />
            <span>
              <strong>Pickup & order updates</strong>
              <small>In-app status updates</small>
            </span>
            <Switch
              checked={notifications.orders}
              onChange={(_, v) => setNotifications({ orders: v })}
              slotProps={{
                input: { "aria-label": "Pickup and order notifications" },
              }}
            />
          </div>
          <div>
            <Bell size={20} />
            <span>
              <strong>Offers</strong>
              <small>Plans and promotions</small>
            </span>
            <Switch
              checked={notifications.offers}
              onChange={(_, v) => setNotifications({ offers: v })}
              slotProps={{ input: { "aria-label": "Offer notifications" } }}
            />
          </div>
        </div>
        <p className="micro">
          These settings control in-app updates. Push notifications are off.
        </p>
        <SectionHeader title="Preferences" />
        <div className="panel menu-list">
          <button onClick={() => setLanguageOpen(true)}>
            <Globe size={20} />
            <span>
              <strong>App language</strong>
              <small>{language}</small>
            </span>
            <ChevronRight size={18} />
          </button>
        </div>
        <SectionHeader title="About" />
        <div className="panel menu-list">
          <Link to="/legal/privacy">
            <ShieldCheck size={20} />
            <strong>Privacy Policy</strong>
            <ChevronRight size={18} />
          </Link>
          <Link to="/legal/terms">
            <ShieldCheck size={20} />
            <strong>Terms & Conditions</strong>
            <ChevronRight size={18} />
          </Link>
          <button onClick={() => setAbout(true)}>
            <Info size={20} />
            <strong>About EasyDry</strong>
            <ChevronRight size={18} />
          </button>
        </div>
        <LogoutButton />
      </main>
      <Dialog open={languageOpen} onClose={() => setLanguageOpen(false)}>
        <DialogTitle>App language</DialogTitle>
        <DialogContent>
          <FormControlLabel
            control={
              <Switch
                checked={language === "English"}
                onChange={() => setLanguage("English")}
              />
            }
            label="English"
          />
          <p className="muted">English only for now.</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLanguageOpen(false)}>Done</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={about} onClose={() => setAbout(false)}>
        <DialogTitle>About EasyDry</DialogTitle>
        <DialogContent>
          <Brand large />
          <p>EasyDry Laundrys · App v1.0.0</p>
          <p>
            Sign-in, prices, payments and orders are simulated.
          </p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAbout(false)}>Got it</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
export function Legal() {
  const { type } = useParams();
  return (
    <>
      <TopAppBar
        title={type === "privacy" ? "Privacy Policy" : "Terms & Conditions"}
      />
      <main className="page legal-page">
        <Intro
          title={type === "privacy" ? "Your data" : "About this demo"}
        >
          Demo application notice · Updated November 2026
        </Intro>
        <div className="panel">
          <h3>
            {type === "privacy"
              ? "Saved on this device"
              : "Demo service"}
          </h3>
          <p>
            {type === "privacy"
              ? "Your profile, addresses, requests and settings are saved in this browser. No real sign-in or payment service is connected."
              : "Prices, offers, pickups, orders and payments are demos. Bookings do not create real service requests."}
          </p>
          <h3>
            {type === "privacy" ? "Your control" : "Pricing and fulfilment"}
          </h3>
          <p>
            {type === "privacy"
              ? "Edit your profile and addresses in the app. Clear this browser’s data to remove saved demo records. Do not enter payment details."
              : "We add an invoice after pickup and item counting. Demo credits have no cash value."}
          </p>
          <h3>Official policies</h3>
          <p>Official EasyDry policies were not provided.</p>
        </div>
      </main>
    </>
  );
}
export function Notifications() {
  const { notifications, requests, orders } = useAppStore();
  return (
    <>
      <TopAppBar title="Notifications" />
      <main className="page">
        <Intro title="Notifications">
          Pickup, order and offer updates.
        </Intro>
        {notifications.orders ? (
          <div className="stack">
            {requests
              .filter((r) => r.status === "scheduled")
              .map((r) => (
                <Link
                  className="panel notification-row"
                  key={r.id}
                  to={`/requests/${r.id}`}
                >
                  <span className="small-icon">
                    <Bell size={21} />
                  </span>
                  <div>
                    <strong>Your pickup is scheduled</strong>
                    <p>
                      #{r.id} · {r.address.area}
                    </p>
                  </div>
                  <ChevronRight size={17} />
                </Link>
              ))}
            {orders
              .filter((o) => o.stage !== "delivered")
              .map((o) => (
                <Link
                  className="panel notification-row"
                  key={o.id}
                  to={`/orders/${o.id}/tracking`}
                >
                  <span className="small-icon">
                    <Bell size={21} />
                  </span>
                  <div>
                    <strong>Order update</strong>
                    <p>#{o.id} · Track order</p>
                  </div>
                  <ChevronRight size={17} />
                </Link>
              ))}
          </div>
        ) : (
          <p className="muted">
            Order updates are turned off. You can enable them in Settings.
          </p>
        )}
        {notifications.offers && (
          <Link className="panel notification-row" to="/offers">
            <span className="small-icon">
              <Bell size={21} />
            </span>
            <div>
              <strong>Offers</strong>
              <p>See current offers.</p>
            </div>
            <ChevronRight size={17} />
          </Link>
        )}
        <Button fullWidth component={Link} to="/settings">
          Notification settings
        </Button>
      </main>
    </>
  );
}
