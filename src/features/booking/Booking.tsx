import { useEffect, useState } from "react";
import { Button, Switch } from "@mui/material";
import {
  ArrowRight,
  Check,
  MapPin,
  CalendarDays,
  PackageCheck,
  Zap,
} from "lucide-react";
import confetti from "canvas-confetti";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAppStore } from "../../store/appStore";
import { services, serviceNames } from "../../services/catalog";
import { TopAppBar } from "../../components/navigation/Navigation";
import { Illustration, ServiceCard } from "../../components/cards/cards";
import {
  ErrorMessage,
  InfoNote,
  Intro,
  PrimaryButton,
  SecondaryButton,
  StickyAction,
} from "../../components/common/ui";
import { ScheduleFields } from "../../components/forms/ScheduleFields";
import { dateLabel } from "../../utils/format";
import { useAsync } from "../../hooks/useAsync";
import { bookingService } from "../../services/bookingService";
export function BookingSteps({ step }: { step: number }) {
  return (
    <div className="booking-steps">
      {["Services", "Schedule", "Address"].map((s, i) => (
        <div key={s} className={i <= step ? "active" : ""}>
          <span>{i < step ? <Check size={12} /> : i + 1}</span>
          {s}
          {i < 2 && <i />}
        </div>
      ))}
    </div>
  );
}
export function SelectService() {
  const { draft, updateDraft } = useAppStore();
  const navigate = useNavigate();
  return (
    <>
      <TopAppBar title="Book a pickup" />
      <BookingSteps step={0} />
      <main className="page action-page">
        <Intro title="Choose a service">
          Select what you need. We’ll count items after pickup.
        </Intro>
        <div className="service-grid selection-grid">
          {services.map((s) => (
            <ServiceCard
              key={s.id}
              id={s.id}
              selected={draft.services.includes(s.id)}
              onClick={() =>
                updateDraft({
                  services: draft.services.includes(s.id)
                    ? draft.services.filter((id) => id !== s.id)
                    : [...draft.services, s.id],
                })
              }
            />
          ))}
        </div>
        <InfoNote>No item count or payment needed now.</InfoNote>
        <div className="panel service-guidance">
          <Illustration type={draft.services[0] ?? "fold"} />
          <div>
            <h3>About this service</h3>
            <p>
              {services.find((s) => s.id === draft.services[0])?.description ??
                "Select a service to see details."}
            </p>
          </div>
        </div>
      </main>
      <StickyAction>
        <div className="action-meta">
          {draft.services.length
            ? `${draft.services.length} service${draft.services.length > 1 ? "s" : ""} selected`
            : "Choose a service to continue"}
          <span>Demo pricing</span>
        </div>
        <PrimaryButton
          disabled={!draft.services.length}
          endIcon={<ArrowRight size={18} />}
          onClick={() => navigate("/booking/schedule")}
        >
          Choose pickup time
        </PrimaryButton>
      </StickyAction>
    </>
  );
}
export function SchedulePickup() {
  const { draft, updateDraft } = useAppStore();
  const navigate = useNavigate();
  return (
    <>
      <TopAppBar title="Schedule pickup" />
      <BookingSteps step={1} />
      <main className="page action-page">
        <ScheduleFields
          date={draft.date}
          slot={draft.slot}
          onDate={(date) =>
            updateDraft({ date, ...(date === draft.date ? {} : { slot: "" }) })
          }
          onSlot={(slot) => updateDraft({ slot })}
        />
        <div className="panel express-option">
          <div className="small-icon">
            <Zap size={21} />
          </div>
          <div>
            <strong>Express pickup</strong>
            <p>24-hour turnaround · +₹99 demo</p>
          </div>
          <Switch
            checked={draft.express}
            onChange={(_, express) => updateDraft({ express })}
            slotProps={{ input: { "aria-label": "Express cleaning" } }}
          />
        </div>
      </main>
      <StickyAction>
        <PrimaryButton
          disabled={!draft.services.length || !draft.date || !draft.slot}
          onClick={() => navigate("/booking/address")}
          endIcon={<ArrowRight size={18} />}
        >
          Choose pickup address
        </PrimaryButton>
      </StickyAction>
    </>
  );
}
export function PickupConfirmation() {
  const { id } = useParams();
  const request = useAppStore((s) => s.requests.find((x) => x.id === id));
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (
      !request ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;

    const timer = window.setTimeout(() => {
      confetti({
        particleCount: 72,
        spread: 68,
        startVelocity: 32,
        origin: { y: 0.56 },
        colors: ["#16805B", "#159BE8", "#75C99A", "#FFD166", "#FFFFFF"],
        disableForReducedMotion: true,
      });
    }, 250);

    return () => window.clearTimeout(timer);
  }, [request]);
  if (!request)
    return (
      <main className="page">
        <Intro title="Pickup not found" />
        <SecondaryButton component={Link} to="/requests">
          View requests
        </SecondaryButton>
      </main>
    );
  return (
    <>
      <TopAppBar title="Pickup confirmed" back={false} />
      <main className="page confirmation-page">
        <div className="success-illustration">
          <Illustration type="confirmation" />
          <span className="confirmation-check" aria-label="Pickup confirmed">
            <Check size={26} strokeWidth={3} />
          </span>
        </div>
        <span className="eyebrow success-text">YOU’RE ALL SET</span>
        <h1>Pickup confirmed.</h1>
        <p className="muted">Your pickup is booked.</p>
        <button
          className="reference-copy"
          onClick={() => {
            navigator.clipboard
              ?.writeText(request.id)
              .then(() => setCopied(true))
              .catch(() => setCopied(false));
          }}
        >
          {copied ? "Copied!" : `Booking ID: ${request.id}`}
        </button>
        <div className="panel confirmation-details">
          <div>
            <CalendarDays size={21} />
            <span>
              <strong>{dateLabel(request.date)}</strong>
              <small>{request.slot}</small>
            </span>
          </div>
          <div>
            <MapPin size={21} />
            <span>
              <strong>{request.address.label}</strong>
              <small>
                {request.address.street}, {request.address.area},{" "}
                {request.address.city} – {request.address.pincode}
              </small>
            </span>
          </div>
          <div>
            <Check size={21} />
            <span>
              <strong>Your services</strong>
              <small>
                {serviceNames(request.services)}
                {request.express ? " · Express" : ""}
              </small>
            </span>
          </div>
        </div>
        <InfoNote>
          You’ll receive your itemized quote after pickup and assessment.
        </InfoNote>
        <PrimaryButton component={Link} to={`/requests/${id}`}>
          View request
        </PrimaryButton>
        <Button fullWidth component={Link} to="/home">
          Back to home
        </Button>
      </main>
    </>
  );
}
export function DemoAssessment({ id }: { id: string }) {
  const { loading, error, run } = useAsync();
  const navigate = useNavigate();
  return (
    <div className="demo-panel request-assessment">
      <div className="request-assessment-heading">
        <span className="small-icon">
          <PackageCheck size={21} />
        </span>
        <span>
          <small>Next step</small>
          <strong>Pickup & item count</strong>
        </span>
      </div>
      <ErrorMessage message={error} />
      <Button
        variant="contained"
        disabled={loading}
        onClick={() =>
          run(
            () => bookingService.assess(id),
            (orderId) => navigate(`/orders/${orderId}`),
          )
        }
      >
        {loading ? "Updating…" : "Simulate pickup"}
      </Button>
      <small className="request-assessment-note">
        Demo only · no real pickup
      </small>
    </div>
  );
}
