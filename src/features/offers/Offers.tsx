import { useState } from "react";
import { Alert, Button, Snackbar, TextField } from "@mui/material";
import { Check, Copy, Tag, TicketPercent } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useAppStore } from "../../store/appStore";
import { TopAppBar } from "../../components/navigation/Navigation";
import { ErrorMessage, Intro } from "../../components/common/ui";
import { coupons } from "../../services/catalog";
import { useAsync } from "../../hooks/useAsync";
import { mockApi } from "../../services/mockApi";
import { today } from "../../utils/format";
type Coupon = (typeof coupons)[number];
export function CouponCard({
  coupon,
  applied,
  onApply,
  disabled,
}: {
  coupon: Coupon;
  applied: boolean;
  onApply: () => void;
  disabled: boolean;
}) {
  const expired = coupon.expires < today();
  return (
    <div
      className={`coupon-card ${expired ? "expired" : ""} ${applied ? "applied" : ""}`}
    >
      <div className="coupon-stub">
        <TicketPercent size={29} />
        <strong>{coupon.percent}%</strong>
        <small>OFF</small>
      </div>
      <div className="coupon-body">
        <h3>{coupon.title}</h3>
        <p>{coupon.description}</p>
        <div className="row between">
          <span className="coupon-code">{coupon.code}</span>
          <Button
            disabled={expired || disabled}
            onClick={onApply}
            startIcon={applied ? <Check size={15} /> : undefined}
          >
            {expired ? "Expired" : applied ? "Applied" : "Apply"}
          </Button>
        </div>
        <small>
          {expired
            ? "Offer ended"
            : `Valid until ${new Date(coupon.expires + "T12:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`}
        </small>
      </div>
    </div>
  );
}
export default function Offers() {
  const [params] = useSearchParams();
  const orderId = params.get("order") ?? undefined;
  const { appliedCoupon, applyCoupon, orders } = useAppStore();
  const [code, setCode] = useState("");
  const [feedback, setFeedback] = useState("");
  const { loading, error, run } = useAsync();
  const current = orderId
    ? orders.find((x) => x.id === orderId)?.coupon
    : appliedCoupon;
  const apply = (value: string) =>
    run(
      () => mockApi(() => applyCoupon(value, orderId)),
      () =>
        setFeedback(
            orderId ? "Coupon applied." : "Coupon saved for your next order.",
        ),
    );
  return (
    <>
      <TopAppBar title="Offers & coupons" />
      <main className="page">
        <div className="offers-hero">
          <span>
            <Tag size={15} />SPECIAL OFFER
          </span>
          <h1>
            Save 20% on laundry.
          </h1>
          <p>
            Use FRESH20 to save up to ₹150.
            <br />
            Minimum order ₹300.
          </p>
          <button
            onClick={() => {
              navigator.clipboard
                ?.writeText("FRESH20")
                .then(() => setFeedback("FRESH20 copied."))
                .catch(() => setFeedback("Use code FRESH20."));
            }}
          >
            FRESH20
            <Copy size={15} />
          </button>
          <TicketPercent
            size={95}
            className="offer-hero-icon"
            strokeWidth={1}
          />
        </div>
        <Intro title={orderId ? "Apply a coupon" : "Offers & coupons"}>
          {orderId
            ? `Order #${orderId}`
            : "Save on your next order."}
        </Intro>
        <form
          className="coupon-form"
          onSubmit={(e) => {
            e.preventDefault();
            void apply(code.trim());
          }}
        >
          <TextField
            size="small"
            label="Coupon code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
          />
          <Button variant="outlined" type="submit" disabled={!code || loading}>
            Apply
          </Button>
        </form>
        <ErrorMessage message={error} />
        <div className="stack">
          {coupons.map((c) => (
            <CouponCard
              key={c.code}
              coupon={c}
              applied={current === c.code}
              disabled={loading}
              onApply={() => apply(c.code)}
            />
          ))}
        </div>
        <Alert severity="info">
          Demo offers. One coupon per order. Apply it before plan credit.
        </Alert>
      </main>
      <Snackbar
        open={!!feedback}
        autoHideDuration={4500}
        onClose={() => setFeedback("")}
        message={feedback}
      />
    </>
  );
}
