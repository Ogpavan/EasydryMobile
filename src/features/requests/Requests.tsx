import { useState } from "react";
import {
  Alert,
  Button,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Tab,
  Tabs,
  TextField,
} from "@mui/material";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  CalendarDays,
  Check,
  CircleHelp,
  ClipboardList,
  MapPin,
  PackageCheck,
  Plus,
  Shirt,
  X,
} from "lucide-react";
import { useAppStore } from "../../store/appStore";
import { TopAppBar } from "../../components/navigation/Navigation";
import { BookingCard } from "../../components/cards/cards";
import {
  ConfirmationDialog,
  EmptyState,
  ErrorMessage,
  Intro,
  PrimaryButton,
  StickyAction,
} from "../../components/common/ui";
import { ScheduleFields } from "../../components/forms/ScheduleFields";
import { dateLabel } from "../../utils/format";
import { serviceNames } from "../../services/catalog";
import { DemoAssessment } from "../booking/Booking";
import { bookingService } from "../../services/bookingService";
import { useAsync } from "../../hooks/useAsync";
export function Requests() {
  const [tab, setTab] = useState(0);
  const requests = useAppStore((s) => s.requests);
  const filtered = requests.filter(
    (x) => x.status === ["scheduled", "collected", "cancelled"][tab],
  );
  return (
    <>
      <TopAppBar
        title="My requests"
        back={false}
        action={
          <Button
            component={Link}
            to="/booking/services"
            startIcon={<Plus size={16} />}
          >
            New pickup
          </Button>
        }
      />
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="fullWidth"
        className="screen-tabs"
      >
        <Tab label="Upcoming" />
        <Tab label="Completed" />
        <Tab label="Cancelled" />
      </Tabs>
      <main className="page">
        <div className="stack">
          {filtered.map((r) => (
            <BookingCard key={r.id} request={r} />
          ))}
        </div>
        {!filtered.length && (
          <EmptyState
            title={tab === 0 ? "No upcoming pickups" : "No pickups yet"}
            description={
              tab === 0
                ? "Book a pickup to get started."
                : "Your pickups will appear here."
            }
            action="Book a pickup"
            to="/booking/services"
          />
        )}
      </main>
    </>
  );
}
export function RequestDetails() {
  const { id } = useParams();
  const { requests, orders } = useAppStore();
  const r = requests.find((x) => x.id === id);
  if (!r)
    return (
      <main className="page">
        <EmptyState
          title="Request not found"
          description="This pickup is unavailable."
          action="My requests"
          to="/requests"
        />
      </main>
    );
  const order = orders.find((x) => x.requestId === id);
  const progressStep = r.status === "scheduled" ? 0 : order ? 2 : 1;
  return (
    <>
      <TopAppBar
        title="Pickup details"
        action={
          <Button
            component={Link}
            to={`/support?reference=${r.id}`}
            size="small"
            startIcon={<CircleHelp size={16} />}
          >
            Get help
          </Button>
        }
      />
      <main className="page">
        <div className={`request-status-hero request-status-${r.status}`}>
          <span className="request-status-icon">
            {r.status === "scheduled" ? (
              <Check size={23} strokeWidth={3} />
            ) : r.status === "cancelled" ? (
              <X size={23} />
            ) : (
              <PackageCheck size={23} />
            )}
          </span>
          <span>
            <small>#{r.id}</small>
            <strong>
              {r.status === "scheduled"
                ? "Pickup booked"
                : r.status === "cancelled"
                  ? "Pickup cancelled"
                  : "Laundry collected"}
            </strong>
          </span>
        </div>
        <div className="panel request-info-card">
          <div className="request-info-row">
            <CalendarDays size={22} />
            <span>
              <small>Pickup time</small>
              <strong>{dateLabel(r.date)}</strong>
              <p>
                {r.slot}
                {r.express ? " · Express" : ""}
              </p>
            </span>
          </div>
          <div className="request-info-row">
            <MapPin size={22} />
            <span>
              <small>Pickup address</small>
              <strong>{r.address.label}</strong>
              <p>
                {r.address.street}, {r.address.area}
                <br />
                {r.address.city}, {r.address.state} – {r.address.pincode}
              </p>
              <small>+91 {r.address.contact}</small>
            </span>
          </div>
          <div className="request-info-row">
            <Shirt size={21} />
            <span>
              <small>Services</small>
              <strong>{serviceNames(r.services)}</strong>
            </span>
          </div>
        </div>
        {r.status !== "cancelled" && (
          <div
            className={`pickup-progress pickup-progress-${r.status}`}
            aria-label="Pickup progress"
          >
            {[
              { label: "Booked", Icon: CalendarDays },
              { label: "Items counted", Icon: PackageCheck },
              { label: "My Orders", Icon: ClipboardList },
            ].map(({ label, Icon }, index) => {
              const done = index < progressStep;
              const current = index === progressStep;
              return (
                <div
                  className={`pickup-progress-step ${done ? "done" : ""} ${current ? "current" : ""}`}
                  key={label}
                >
                  <span>{done ? <Check size={14} /> : <Icon size={15} />}</span>
                  <small>{label}</small>
                </div>
              );
            })}
            <div
              className={`pickup-progress-track pickup-progress-step-${progressStep + 1}`}
              aria-hidden="true"
            >
              <span />
            </div>
          </div>
        )}
        {r.status === "scheduled" && (
          <>
            <div className="two-actions">
              <Button
                variant="outlined"
                component={Link}
                to={`/requests/${id}/reschedule`}
                startIcon={<CalendarDays size={16} />}
              >
                Change time
              </Button>
              <Button
                color="error"
                variant="outlined"
                component={Link}
                to={`/requests/${id}/cancel`}
                startIcon={<X size={16} />}
              >
                Cancel
              </Button>
            </div>
            <DemoAssessment id={r.id} />
          </>
        )}
        {r.status === "cancelled" && (
          <>
            <Alert severity="info">
              {r.cancelReason}
              {r.cancelNotes ? ` · ${r.cancelNotes}` : ""}
            </Alert>
            <PrimaryButton component={Link} to="/booking/services">
              Book another pickup
            </PrimaryButton>
          </>
        )}
        {order && (
          <PrimaryButton component={Link} to={`/orders/${order.id}`}>
            View order
          </PrimaryButton>
        )}
      </main>
    </>
  );
}
export function Reschedule() {
  const { id } = useParams();
  const request = useAppStore((s) => s.requests.find((x) => x.id === id));
  const [date, setDate] = useState(request?.date ?? "");
  const [slot, setSlot] = useState(request?.slot ?? "");
  const { loading, error, run } = useAsync();
  const navigate = useNavigate();
  if (!request || request.status !== "scheduled")
    return (
      <main className="page">
        <EmptyState
          title="Rescheduling unavailable"
          description="Only upcoming pickups can be rescheduled."
          action="My requests"
          to="/requests"
        />
      </main>
    );
  return (
    <>
      <TopAppBar title="Reschedule pickup" />
      <main className="page action-page">
        <Intro title="Change pickup time">Choose a new date and time.</Intro>
        <div className="panel current-schedule">
          <span className="eyebrow">CURRENT PICKUP · #{id}</span>
          <strong>{dateLabel(request.date)}</strong>
          <p>{request.slot}</p>
        </div>
        <ScheduleFields
          date={date}
          slot={slot}
          onDate={(nextDate) => {
            setDate(nextDate);
            if (nextDate !== date) setSlot("");
          }}
          onSlot={setSlot}
        />
        <ErrorMessage message={error} />
      </main>
      <StickyAction>
        <PrimaryButton
          disabled={
            !date || !slot || (date === request.date && slot === request.slot)
          }
          loading={loading}
          onClick={() =>
            run(
              () => bookingService.reschedule(request.id, date, slot),
              () => navigate(`/requests/${id}`, { replace: true }),
            )
          }
        >
          Save new time
        </PrimaryButton>
      </StickyAction>
    </>
  );
}
const reasons = [
  "Plans changed",
  "Wrong date or address",
  "Pickup no longer needed",
  "Time does not work",
  "Something else",
];
export function CancelPickup() {
  const { id } = useParams();
  const request = useAppStore((s) => s.requests.find((x) => x.id === id));
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [open, setOpen] = useState(false);
  const { loading, error, run } = useAsync();
  const navigate = useNavigate();
  if (!request || request.status !== "scheduled")
    return (
      <main className="page">
        <EmptyState
          title="Cancellation unavailable"
          description="This pickup can no longer be cancelled."
          action="My requests"
          to="/requests"
        />
      </main>
    );
  return (
    <>
      <TopAppBar title="Cancel pickup" />
      <main className="page action-page">
        <Intro title="Cancel this pickup">
          You can also choose a new time.
        </Intro>
        <Button
          variant="outlined"
          fullWidth
          component={Link}
          to={`/requests/${id}/reschedule`}
        >
          Change pickup time
        </Button>
        <div className="panel cancellation-reasons">
          <FormControl fullWidth>
            <RadioGroup
              aria-label="Cancellation reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              {reasons.map((r) => (
                <FormControlLabel
                  key={r}
                  value={r}
                  control={<Radio />}
                  label={r}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </div>
        <TextField
          multiline
          minRows={3}
          label="Anything else? (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          slotProps={{ htmlInput: { maxLength: 500 } }}
        />
        <ErrorMessage message={error} />
      </main>
      <StickyAction>
        <PrimaryButton
          color="error"
          disabled={!reason}
          onClick={() => setOpen(true)}
        >
          Cancel pickup
        </PrimaryButton>
      </StickyAction>
      <ConfirmationDialog
        open={open}
        title="Cancel this pickup?"
        confirmLabel="Yes, cancel pickup"
        danger
        loading={loading}
        onClose={() => setOpen(false)}
        onConfirm={() =>
          run(
            () => bookingService.cancel(request.id, reason, notes),
            () => navigate(`/requests/${id}`, { replace: true }),
          )
        }
      >
        Your pickup on {dateLabel(request.date)} will be cancelled. There is no
        cancellation fee. {error && <ErrorMessage message={error} />}
      </ConfirmationDialog>
    </>
  );
}
