import type { ReactNode } from "react";
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import type { ButtonProps, TextFieldProps } from "@mui/material";
import {
  ArrowRight,
  Check,
  ChevronRight,
  PackageOpen,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { Order } from "../../types";
import { money } from "../../utils/format";
import { subtotal, total } from "../../services/orderService";
export function PrimaryButton({
  loading,
  children,
  ...props
}: ButtonProps & { loading?: boolean; to?: string }) {
  return (
    <Button
      variant="contained"
      fullWidth
      {...props}
      disabled={props.disabled || loading}
    >
      {loading ? <CircularProgress size={20} color="inherit" /> : children}
    </Button>
  );
}
export function SecondaryButton(props: ButtonProps & { to?: string }) {
  return <Button variant="outlined" fullWidth {...props} />;
}
export function SectionHeader({
  title,
  action,
  to,
}: {
  title: string;
  action?: string;
  to?: string;
}) {
  return (
    <div className="section-header">
      <h3>{title}</h3>
      {action && to && (
        <Link to={to}>
          {action}
          <ChevronRight size={15} />
        </Link>
      )}
    </div>
  );
}
export function EmptyState({
  title,
  description,
  action,
  to,
}: {
  title: string;
  description: string;
  action?: string;
  to?: string;
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <PackageOpen size={32} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action && to && (
        <Button component={Link} to={to} variant="contained">
          {action}
        </Button>
      )}
    </div>
  );
}
export function LoadingSkeleton() {
  return (
    <div className="service-loader" role="status" aria-label="Loading">
      <CircularProgress size={28} thickness={4} />
    </div>
  );
}
export function ConfirmationDialog({
  open,
  title,
  children,
  onClose,
  onConfirm,
  loading,
  danger = false,
  confirmLabel = "Confirm",
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  danger?: boolean;
  confirmLabel?: string;
}) {
  return (
    <Dialog open={open} onClose={loading ? undefined : onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>{children}</DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Keep as is
        </Button>
        <Button
          color={danger ? "error" : "primary"}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? "Please wait…" : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
export function FormField(props: TextFieldProps) {
  return <TextField {...props} />;
}
export function ErrorMessage({ message }: { message: string }) {
  return message ? (
    <Alert severity="error" role="alert">
      {message}
    </Alert>
  ) : null;
}
export function StickyAction({ children }: { children: ReactNode }) {
  return <div className="sticky-action">{children}</div>;
}
export function Intro({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="intro">
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2>{title}</h2>
      {children && <p>{children}</p>}
    </div>
  );
}
export function InfoNote({ children }: { children: ReactNode }) {
  return (
    <div className="info-note">
      <ShieldCheck size={17} />
      <span>{children}</span>
    </div>
  );
}
export function PriceSummary({ order }: { order: Order }) {
  return (
    <div className="price-summary">
      <div>
        <span>Cleaning subtotal</span>
        <span>{money(subtotal(order) - order.expressFee)}</span>
      </div>
      {order.expressFee > 0 && (
        <div>
          <span>Express care</span>
          <span>{money(order.expressFee)}</span>
        </div>
      )}
      {order.discount > 0 && (
        <div className="success-text">
          <span>Coupon {order.coupon}</span>
          <span>−{money(order.discount)}</span>
        </div>
      )}
      {order.packageCredit > 0 && (
        <div className="success-text">
          <span>Package credit</span>
          <span>−{money(order.packageCredit)}</span>
        </div>
      )}
      <div className="price-total">
        <strong>{order.paid ? "Total paid" : "Amount to pay"}</strong>
        <strong>{money(total(order))}</strong>
      </div>
      <p className="micro">Demo prices · taxes included</p>
    </div>
  );
}
export function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="check-list">
      {items.map((x) => (
        <li key={x}>
          <Check size={16} />
          {x}
        </li>
      ))}
    </ul>
  );
}
export function PromotionBanner() {
  return (
    <Link to="/offers" className="offer-strip">
      <div className="small-icon">
        <Sparkles size={22} />
      </div>
      <div>
        <strong>Save 20% with FRESH20</strong>
        <p>On eligible orders</p>
      </div>
      <ArrowRight size={19} />
    </Link>
  );
}
