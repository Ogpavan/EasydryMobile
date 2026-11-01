import { useState } from "react";
import { Alert, Button, Rating, Tab, Tabs } from "@mui/material";
import {
  Check,
  CheckCheck,
  ChevronRight,
  Circle,
  PackageCheck,
  Tag,
  Wallet,
  ArrowRight,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { TopAppBar } from "../../components/navigation/Navigation";
import {
  Illustration,
  OrderCard,
  StatusChip,
} from "../../components/cards/cards";
import {
  EmptyState,
  ErrorMessage,
  InfoNote,
  Intro,
  PriceSummary,
  PrimaryButton,
  StickyAction,
} from "../../components/common/ui";
import { useAppStore } from "../../store/appStore";
import { serviceNames } from "../../services/catalog";
import { stages, total } from "../../services/orderService";
import { money } from "../../utils/format";
import { PaymentMethodSheet } from "../payments/PaymentMethodSheet";
import { useAsync } from "../../hooks/useAsync";
import { mockApi } from "../../services/mockApi";
export function Orders() {
  const [tab, setTab] = useState(0);
  const orders = useAppStore((s) => s.orders);
  const filtered = orders.filter((o) =>
    tab === 0 ? o.stage !== "delivered" : o.stage === "delivered",
  );
  return (
    <>
      <TopAppBar title="My orders" back={false} />
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="fullWidth"
        className="screen-tabs"
      >
        <Tab label="In progress" />
        <Tab label="Completed" />
      </Tabs>
      <main className="page">
        <div className="list-intro">
          <h3>
            {tab === 0
              ? "Orders in progress"
              : "Completed orders"}
          </h3>
          <p>
            {tab === 0
              ? "Track your laundry."
              : "Your past orders."}
          </p>
        </div>
        <div className="stack">
          {filtered.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
        {!filtered.length && (
          <EmptyState
            title="No orders yet"
            description="Orders appear after pickup and item counting."
            action="Schedule a pickup"
            to="/booking/services"
          />
        )}
        <InfoNote>
          Pickups stay in Requests until we collect and count your items.
        </InfoNote>
      </main>
    </>
  );
}
export function OrderTimeline({ stage }: { stage: string }) {
  const current = stages.findIndex((s) => s.id === stage);
  return (
    <ol className="order-timeline" data-stage={stage}>
      {stages.map((s, i) => (
        <li
          key={s.id}
          className={
            i < current ? "done" : i === current ? "current" : "pending"
          }
        >
          <div className="timeline-dot">
            {i < current ? (
              <Check size={15} />
            ) : i === current ? (
              <Circle size={12} fill="currentColor" />
            ) : (
              <Circle size={10} />
            )}
          </div>
          <div>
            <h3>{s.label}</h3>
            <p>{s.description}</p>
            {i === current && (
              <span className="timeline-current">
                {stage === "delivered" ? "DELIVERED" : "CURRENT STATUS"}
              </span>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
export function Tracking() {
  const { id } = useParams();
  const { orders, advanceOrder } = useAppStore();
  const order = orders.find((o) => o.id === id);
  const { run, loading, error } = useAsync();
  const navigate = useNavigate();
  if (!order) return <OrderNotFound />;
  const index = stages.findIndex((s) => s.id === order.stage);
  return (
    <>
      <TopAppBar title="Track your order" />
      <main className="page">
        <div className="row between">
          <span className="reference">#{id}</span>
          <StatusChip status={order.stage} />
        </div>
        <div className="tracking-heading">
          <Illustration type={order.services[0]} />
          <h2>
            {order.stage === "delivered"
              ? "Order delivered"
              : order.stage === "processing"
                ? "Cleaning in progress"
                : stages[index].label}
          </h2>
          <p>
            {order.stage === "delivered"
              ? "Your laundry is back."
              : "We’re cleaning your laundry."}
          </p>
        </div>
        <div className="panel">
          <OrderTimeline stage={order.stage} />
        </div>
        <Button
          component={Link}
          to={`/orders/${id}`}
          fullWidth
          endIcon={<ChevronRight size={17} />}
        >
          View order details
        </Button>
        {order.stage !== "delivered" ? (
          <div className="demo-panel">
            <span className="eyebrow">DEMO</span>
            <h3>Update order status</h3>
            <p>
              Move this demo order to “{stages[index + 1].label}”. Pay the
              invoice before delivery.
            </p>
            <ErrorMessage message={error} />
            <Button
              variant="outlined"
              disabled={loading}
              onClick={() =>
                run(
                  () => mockApi(() => advanceOrder(order.id)),
                  () => {
                    if (index === 3) navigate(`/orders/${id}/delivered`);
                  },
                )
              }
            >
              {loading
                ? "Updating…"
                : `Set to ${stages[index + 1].label.toLowerCase()}`}
            </Button>
          </div>
        ) : (
          <PrimaryButton component={Link} to={`/orders/${id}/delivered`}>
            View delivery summary
          </PrimaryButton>
        )}
        <Button component={Link} to={`/support?reference=${id}`} fullWidth>
          Get help with this order
        </Button>
      </main>
    </>
  );
}
function OrderNotFound() {
  return (
    <main className="page">
      <EmptyState
        title="Order not found"
        description="This order is unavailable."
        action="My orders"
        to="/orders"
      />
    </main>
  );
}
export function OrderDetails() {
  const { id } = useParams();
  const { orders, activePlan, redeem, payments } = useAppStore();
  const order = orders.find((o) => o.id === id);
  const [payment, setPayment] = useState(false);
  const { error, run } = useAsync();
  if (!order) return <OrderNotFound />;
  const transaction = payments.find(
    (p) => p.orderId === id && p.status === "success",
  );
  return (
    <>
      <TopAppBar title="Order details" />
      <main className={`page ${!order.paid ? "action-page" : ""}`}>
        <div className="row between">
          <span className="reference">#{id}</span>
          <StatusChip status={order.stage} />
        </div>
        <Intro title="Order details">
          {serviceNames(order.services)} · Counted after pickup
        </Intro>
        <Link to={`/orders/${id}/tracking`} className="tracking-link">
          <div className="small-icon">
            <PackageCheck size={23} />
          </div>
          <span>
            <strong>{stages.find((s) => s.id === order.stage)?.label}</strong>
            <small>Track your laundry</small>
          </span>
          <ArrowRight size={20} />
        </Link>
        <div className="panel invoice">
          <div className="section-header">
            <h3>Invoice</h3>
            <span className="micro">DEMO PRICING</span>
          </div>
          <div className="invoice-head">
            <span>Garment / article</span>
            <span>Qty</span>
            <span>Amount</span>
          </div>
          {order.items.map((item, i) => (
            <div className="invoice-row" key={`${item.name}-${i}`}>
              <div>
                <strong>{item.name}</strong>
                <small>
                  {money(item.price)}{" "}
                  {item.unit === "kg"
                    ? "/ kg"
                    : item.unit === "pair"
                      ? "/ pair"
                      : "each"}
                </small>
              </div>
              <span>{item.quantity}</span>
              <strong>{money(item.quantity * item.price)}</strong>
            </div>
          ))}
          <PriceSummary order={order} />
        </div>
        <div className="payment-status row between">
          <span>Payment status</span>
          <StatusChip status={order.paid ? "paid" : "unpaid"} />
        </div>
        {!order.paid && (
          <>
            <Link className="panel coupon-entry" to={`/offers?order=${id}`}>
              <Tag size={20} />
              <span>
                {order.coupon
                  ? `${order.coupon} applied · ${money(order.discount)} saved`
                  : "Add a coupon"}
              </span>
              <ChevronRight size={18} />
            </Link>
            {activePlan && activePlan.balance > 0 && (
              <div className="panel wallet-entry">
                <Wallet size={21} />
                <span>
                  <strong>{money(activePlan.balance)} credit available</strong>
                  <small>Use your laundry plan balance</small>
                </span>
                <Button
                  onClick={() => run(() => mockApi(() => redeem(order.id)))}
                >
                  Use credit
                </Button>
              </div>
            )}
          </>
        )}
        <ErrorMessage message={error} />
        {transaction && (
          <Alert severity="success">
            Demo payment recorded via {transaction.method}. Reference{" "}
            {transaction.id}. No real money was charged.
          </Alert>
        )}
        {order.packageCredit > 0 && (
          <InfoNote>
            {money(order.packageCredit)} has been deducted from your package
            balance.
          </InfoNote>
        )}
        {order.stage === "delivered" && (
          <PrimaryButton component={Link} to={`/orders/${id}/delivered`}>
            View delivery & rate experience
          </PrimaryButton>
        )}
        <Button fullWidth component={Link} to={`/support?reference=${id}`}>
          Need help with this order?
        </Button>
      </main>
      {!order.paid && (
        <StickyAction>
          <div className="payment-action">
            <div>
              <span>Amount to pay</span>
              <strong>{money(total(order))}</strong>
            </div>
            <PrimaryButton onClick={() => setPayment(true)}>
              Pay now
              <ArrowRight size={18} />
            </PrimaryButton>
          </div>
          <p className="micro center">Demo payment · no real charge</p>
        </StickyAction>
      )}
      {payment && (
        <PaymentMethodSheet
          open
          onClose={() => setPayment(false)}
          amount={total(order)}
          orderId={order.id}
        />
      )}
    </>
  );
}
export function Delivered() {
  const { id } = useParams();
  const { orders, rate } = useAppStore();
  const order = orders.find((x) => x.id === id);
  const [saved, setSaved] = useState(false);
  if (!order) return <OrderNotFound />;
  if (order.stage !== "delivered")
    return (
      <>
        <TopAppBar title="Delivery status" />
        <main className="page">
          <Intro title="Not delivered yet">
            Track your order for updates.
          </Intro>
          <PrimaryButton component={Link} to={`/orders/${id}/tracking`}>
            Track order
          </PrimaryButton>
        </main>
      </>
    );
  return (
    <>
      <TopAppBar title="Order delivered" />
      <main className="page delivered-page">
        <div className="success-illustration">
          <Illustration type="towels" />
          <span>
            <CheckCheck size={27} />
          </span>
        </div>
        <span className="eyebrow success-text">
          ORDER COMPLETE
        </span>
        <h1>
          Laundry delivered.
        </h1>
        <p className="muted">
          Your clean laundry is back.
        </p>
        <div className="panel delivered-summary">
          <div className="row between">
            <strong>#{order.id}</strong>
            <StatusChip status="delivered" />
          </div>
          <p>{serviceNames(order.services)}</p>
          <PriceSummary order={order} />
          <StatusChip status={order.paid ? "paid" : "unpaid"} />
          <p className="micro">
            Demo prices and payment.
          </p>
        </div>
        <div className="panel rating-panel">
          <h3>Rate your order</h3>
          <p>How did we do?</p>
          <Rating
            value={order.rating ?? 0}
            onChange={(_, value) => {
              if (value) {
                rate(order.id, value);
                setSaved(true);
              }
            }}
            size="large"
          />
          {saved && (
            <span className="success-text">
              Thanks for your feedback.
            </span>
          )}
        </div>
        <PrimaryButton component={Link} to="/booking/services">
          Book another pickup
        </PrimaryButton>
        <Button component={Link} to="/home" fullWidth>
          Back to home
        </Button>
      </main>
    </>
  );
}
