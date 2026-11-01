import { Button, Chip, Radio } from "@mui/material";
import { colors, statusColors } from "../../app/colors";
import {
  CalendarClock,
  Check,
  ChevronRight,
  Clock3,
  Home,
  X,
  BriefcaseBusiness,
  ArrowUpRight,
  Pencil,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";
import type {
  Address,
  Order,
  PickupRequest,
  Plan,
  ServiceId,
} from "../../types";
import { services, serviceNames } from "../../services/catalog";
import { dateLabel, money } from "../../utils/format";
import { itemSummary, total } from "../../services/orderService";
import { CheckList } from "../common/ui";
import hero from "../../assets/illustrations/laundry-hero.webp";
import fold from "../../assets/illustrations/fold.webp";
import iron from "../../assets/illustrations/iron.webp";
import dry from "../../assets/illustrations/dry.webp";
import shoe from "../../assets/illustrations/shoe.webp";
import rafu from "../../assets/illustrations/rafu.webp";
import scooter from "../../assets/illustrations/scooter.webp";
import towels from "../../assets/illustrations/towels.webp";
import packages from "../../assets/illustrations/packages.webp";
import confirmation from "../../assets/illustrations/confirmation.webp";
const art = {
  fold,
  iron,
  dry,
  shoe,
  rafu,
  hero,
  scooter,
  towels,
  packages,
  confirmation,
};
export function Illustration({
  type = "hero",
  className = "",
}: {
  type?: keyof typeof art;
  className?: string;
}) {
  return (
    <img
      className={`illustration ${className}`}
      src={art[type]}
      alt=""
      draggable="false"
    />
  );
}
export function ServiceCard({
  id,
  selected,
  onClick,
  compact = false,
}: {
  id: ServiceId;
  selected?: boolean;
  onClick: () => void;
  compact?: boolean;
}) {
  const service = services.find((s) => s.id === id)!;
  return (
    <button
      className={`service-card ${selected ? "selected" : ""} ${compact ? "compact" : ""}`}
      onClick={onClick}
      aria-pressed={selected}
      data-service={id}
    >
      <div className="service-art">
        <Illustration type={id} />
        {selected ? (
          <span className="service-check">
            <Check size={14} />
          </span>
        ) : (
          <ArrowUpRight className="service-arrow" size={17} />
        )}
      </div>
      <div className="service-copy">
        <h3>{service.name}</h3>
        <p>{service.subtitle}</p>
      </div>
    </button>
  );
}
export function StatusChip({ status }: { status: string }) {
  const tone = statusColors[status] ?? {
    foreground: colors.neutralForeground,
    surface: colors.neutralSoft,
  };
  const labels: Record<string, string> = {
    scheduled: "Pickup scheduled",
    collected: "Pickup completed",
    processing: "In progress",
    ready: "Ready for delivery",
    out: "Out for delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
    paid: "Paid",
    unpaid: "Payment pending",
  };
  return (
    <Chip
      size="small"
      label={labels[status] ?? status}
      sx={{ color: tone.foreground, backgroundColor: tone.surface }}
    />
  );
}
export function BookingCard({
  request,
  compact = false,
}: {
  request: PickupRequest;
  compact?: boolean;
}) {
  return (
    <div className="panel address-card booking-card">
      <Link
        className="address-select booking-select"
        aria-label={`View pickup ${request.id}`}
        to={`/requests/${request.id}`}
      >
        <div className="small-icon">
          <CalendarClock size={21} />
        </div>
        <span className="booking-select-copy">
          <strong>{dateLabel(request.date)}</strong>
          <p>{request.slot}</p>
          <small className="micro">#{request.id}</small>
        </span>
        <StatusChip status={request.status} />
        <ChevronRight size={18} className="booking-select-arrow" />
      </Link>
      {!compact && request.status === "scheduled" && (
        <div className="address-actions request-actions">
          <Button
            component={Link}
            to={`/requests/${request.id}/reschedule`}
            size="small"
            startIcon={<CalendarClock size={16} />}
          >
            Reschedule
          </Button>
          <Button
            component={Link}
            to={`/requests/${request.id}/cancel`}
            size="small"
            color="inherit"
            startIcon={<X size={16} />}
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}
export function OrderCard({ order }: { order: Order }) {
  return (
    <Link className="panel order-card" to={`/orders/${order.id}`}>
      <div className="row between">
        <span className="reference">#{order.id}</span>
        <StatusChip status={order.stage} />
      </div>
      <div className="row order-middle">
        <div className="order-art" data-service={order.services[0]}>
          <Illustration type={order.services[0]} />
        </div>
        <div>
          <h3>{serviceNames(order.services)}</h3>
          <p>
            {itemSummary(order)} ·{" "}
            {new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
            })}
          </p>
        </div>
        <ChevronRight size={18} />
      </div>
      <div className="order-footer">
        <span>{order.paid ? "Paid" : "Amount due"}</span>
        <strong>{money(total(order))}</strong>
      </div>
    </Link>
  );
}
export function AddressCard({
  address,
  selected,
  onSelect,
  onEdit,
  onDelete,
}: {
  address: Address;
  selected: boolean;
  onSelect: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  return (
    <div className={`panel address-card ${selected ? "selected" : ""}`}>
      <button
        className="address-select"
        onClick={onSelect}
        aria-label={`Select ${address.label} address`}
        aria-pressed={selected}
      >
        <div className="small-icon">
          {address.label === "Work" ? (
            <BriefcaseBusiness size={21} />
          ) : (
            <Home size={21} />
          )}
        </div>
        <div>
          <strong>{address.label}</strong>
          <p>
            {address.street}
            <br />
            {address.area}, {address.city}
            <br />
            {address.state} – {address.pincode}
          </p>
          <span className="micro">+91 {address.contact}</span>
        </div>
        <Radio checked={selected} tabIndex={-1} disableRipple />
      </button>
      {onEdit && (
        <div className="address-actions">
          <Button
            size="small"
            startIcon={<Pencil size={16} />}
            onClick={onEdit}
          >
            Edit address
          </Button>
          <Button
            size="small"
            color="error"
            startIcon={<Trash2 size={16} />}
            onClick={onDelete}
          >
            Delete
          </Button>
        </div>
      )}
    </div>
  );
}
export function PackageCard({
  plan,
  onPurchase,
  active,
}: {
  plan: Plan;
  onPurchase: () => void;
  active?: boolean;
}) {
  return (
    <div
      className={`panel package-card ${plan.id === "plus" ? "recommended" : ""}`}
    >
      <div className="row between">
        <span className="eyebrow">
          {plan.id === "plus" ? "MOST POPULAR" : "LAUNDRY, SORTED"}
        </span>
        <Chip
          className="bonus-chip"
          label={`${plan.bonus}% extra credit`}
          color="secondary"
          variant="outlined"
        />
      </div>
      <h3>{plan.name}</h3>
      <div className="plan-price">
        {money(plan.price)}
        <span> / recharge</span>
      </div>
      <p>
        Get <strong>{money(plan.credit)}</strong> in laundry credit
      </p>
      <CheckList items={plan.benefits} />
      <Button
        fullWidth
        variant={plan.id === "plus" ? "contained" : "outlined"}
        onClick={onPurchase}
      >
        {active ? "Recharge plan" : "Get this plan"}
      </Button>
    </div>
  );
}
export function Turnaround() {
  return (
    <div className="row turnaround">
      <Clock3 size={15} />
      <span>Cleaned and delivered in 48–72 hours.</span>
    </div>
  );
}
