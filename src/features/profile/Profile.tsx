import { useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import {
  ClipboardList,
  ShoppingBag,
  Wallet,
  MapPin,
  CreditCard,
  LogOut,
  ChevronRight,
  Settings,
  CircleHelp,
  TicketPercent,
  Pencil,
  UserRound,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { TopAppBar } from "../../components/navigation/Navigation";
import {
  ConfirmationDialog,
  EmptyState,
  FormField,
  Intro,
  SectionHeader,
} from "../../components/common/ui";
import { useAppStore } from "../../store/appStore";
import { money } from "../../utils/format";
const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(50),
  email: z.union([z.literal(""), z.email("Enter a valid email address.")]),
});
export function LogoutButton() {
  const [open, setOpen] = useState(false);
  const logout = useAppStore((s) => s.logout);
  const navigate = useNavigate();
  return (
    <>
      <Button
        className="logout-button"
        color="error"
        startIcon={<LogOut size={19} />}
        onClick={() => setOpen(true)}
      >
        Log out
      </Button>
      <ConfirmationDialog
        open={open}
        title="Log out of EasyDry?"
        confirmLabel="Log out"
        onClose={() => setOpen(false)}
        onConfirm={() => {
          logout();
          navigate("/login", { replace: true });
        }}
      >
      Your saved pickups and orders will be here when you return.
      </ConfirmationDialog>
    </>
  );
}
export function Profile() {
  const { profile, updateProfile, activePlan } = useAppStore();
  const [edit, setEdit] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: profile,
  });
  const links = [
    {
      label: "My requests",
      sub: "View and change pickups",
      to: "/requests",
      Icon: ClipboardList,
    },
    {
      label: "My orders",
      sub: "Track cleaning and delivery",
      to: "/orders",
      Icon: ShoppingBag,
    },
    {
      label: "My plans",
      sub: activePlan
        ? `${money(activePlan.balance)} credit available`
        : "Save with a laundry plan",
      to: "/packages",
      Icon: Wallet,
    },
    {
      label: "Manage addresses",
      sub: "Edit saved addresses",
      to: "/addresses",
      Icon: MapPin,
    },
    {
      label: "Payment activity",
      sub: "View payment history",
      to: "/payment-methods",
      Icon: CreditCard,
    },
    {
      label: "Offers & coupons",
      sub: "Save on your orders",
      to: "/offers",
      Icon: TicketPercent,
    },
  ];
  return (
    <>
      <TopAppBar title="My account" back={false} />
      <main className="page">
        <div className="profile-header">
          <div className="avatar">
            {profile.name.slice(0, 1).toUpperCase() || <UserRound />}
          </div>
          <div>
            <h2>{profile.name}</h2>
            <p>+91 {profile.phone}</p>
            <span className="micro">
              {profile.email || "Add an email in your profile."}
            </span>
          </div>
          <Button
            aria-label="Edit profile"
            onClick={() => {
              reset(profile);
              setEdit(true);
            }}
          >
            <Pencil size={18} />
          </Button>
        </div>
        <SectionHeader title="Account" />
        <div className="panel menu-list">
          {links.map(({ label, sub, to, Icon }) => (
            <Link key={to} to={to}>
              <span className="menu-icon">
                <Icon size={21} />
              </span>
              <span>
                <strong>{label}</strong>
                <small>{sub}</small>
              </span>
              <ChevronRight size={18} />
            </Link>
          ))}
        </div>
        <SectionHeader title="More" />
        <div className="panel menu-list">
          {[
            { label: "Help & support", to: "/support", Icon: CircleHelp },
            { label: "Settings", to: "/settings", Icon: Settings },
          ].map(({ label, to, Icon }) => (
            <Link key={to} to={to}>
              <span className="menu-icon">
                <Icon size={21} />
              </span>
              <strong>{label}</strong>
              <ChevronRight size={18} />
            </Link>
          ))}
        </div>
        <LogoutButton />
        <p className="account-footer">
          EasyDry Laundrys · v1.0.0
          <br />
          <span>Pickup, cleaning and delivery.</span>
        </p>
      </main>
      <Dialog open={edit} onClose={() => setEdit(false)}>
        <DialogTitle>Edit your profile</DialogTitle>
        <form
          onSubmit={handleSubmit((values) => {
            updateProfile({ ...profile, ...values });
            setEdit(false);
          })}
        >
          <DialogContent className="stack">
            <FormField
              label="Full name"
              autoComplete="name"
              {...register("name")}
              error={!!errors.name}
              helperText={errors.name?.message}
            />
            <FormField
              label="Email address (optional)"
              autoComplete="email"
              {...register("email")}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
            <FormField
              label="Mobile number"
              value={`+91 ${profile.phone}`}
              disabled
              helperText="Used for pickup updates."
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEdit(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              Save changes
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}
export function PaymentMethods() {
  const payments = useAppStore((s) => s.payments);
  return (
    <>
      <TopAppBar title="Payment activity" />
      <main className="page">
        <Intro title="Payment history">
          Demo payments only. No card details are saved.
        </Intro>
        <div className="panel payment-method-info">
          <CreditCard size={26} />
          <div>
            <h3>Choose at checkout</h3>
            <p>
              Pay by UPI, card or net banking in the demo.
            </p>
          </div>
        </div>
        <SectionHeader title="Recent payments" />
        {payments.length ? (
          <div className="stack">
            {payments.map((p) => (
              <div className="panel transaction-card" key={p.id}>
                <div className="row between">
                  <strong>{p.purpose}</strong>
                  <strong>{money(p.amount)}</strong>
                </div>
                <p>
                  {p.method} ·{" "}
                  {new Date(p.createdAt).toLocaleDateString("en-IN")}
                </p>
                <span
                  className={
                    p.status === "success" ? "success-text" : "error-text"
                  }
                >
                  {p.status === "success"
                    ? "Paid · demo"
                    : "Payment declined · demo"}
                </span>
                <small>{p.id}</small>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No payments yet"
            description="Payments will appear here."
          />
        )}
        <Alert severity="info">Demo payments only.</Alert>
      </main>
    </>
  );
}
