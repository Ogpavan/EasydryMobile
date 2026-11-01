import {
  ArrowLeft,
  Home,
  ClipboardList,
  ShoppingBag,
  UserRound,
  Bell,
} from "lucide-react";
import { IconButton } from "@mui/material";
import { Link, NavLink, useNavigate } from "react-router-dom";
import easyDryLogo from "../../assets/branding/easydry-logo.webp";
export function Brand({ large = false }: { large?: boolean }) {
  return (
    <span className={`brand ${large ? "large" : ""}`}>
      <img src={easyDryLogo} alt="EasyDry Laundrys" />
    </span>
  );
}
export function TopAppBar({
  title,
  back = true,
  action,
}: {
  title: string;
  back?: boolean;
  action?: React.ReactNode;
}) {
  const navigate = useNavigate();
  return (
    <header className="top-app-bar">
      {back && (
        <IconButton
          aria-label="Go back"
          onClick={() =>
            window.history.state?.idx > 0 ? navigate(-1) : navigate("/home")
          }
        >
          <ArrowLeft size={22} />
        </IconButton>
      )}
      <h2>{title}</h2>
      {action}
    </header>
  );
}
export function BottomNavigation() {
  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {[
        { to: "/home", label: "Home", Icon: Home },
        { to: "/requests", label: "Requests", Icon: ClipboardList },
        { to: "/orders", label: "Orders", Icon: ShoppingBag },
        { to: "/account", label: "Account", Icon: UserRound },
      ].map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <span>
            <Icon size={22} />
          </span>
          <small>{label}</small>
        </NavLink>
      ))}
    </nav>
  );
}
export function NotificationButton() {
  return (
    <IconButton
      component={Link}
      to="/notifications"
      aria-label="Notifications"
      className="notification-button"
    >
      <Bell size={22} />
      <i />
    </IconButton>
  );
}
