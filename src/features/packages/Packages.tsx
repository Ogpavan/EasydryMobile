import { useState } from "react";
import { Wallet, Sparkles, ArrowUpRight } from "lucide-react";
import { TopAppBar } from "../../components/navigation/Navigation";
import { PackageCard, Illustration } from "../../components/cards/cards";
import { InfoNote, Intro } from "../../components/common/ui";
import { useAppStore } from "../../store/appStore";
import { plans } from "../../services/catalog";
import type { Plan } from "../../types";
import { money } from "../../utils/format";
import { PaymentMethodSheet } from "../payments/PaymentMethodSheet";
export default function Packages() {
  const active = useAppStore((s) => s.activePlan);
  const [selected, setSelected] = useState<Plan | null>(null);
  return (
    <>
      <TopAppBar title="Laundry plans" />
      <main className="page">
        <Intro
          eyebrow="LAUNDRY PLANS"
          title="Save on laundry"
        >
          Add credit and get a bonus.
        </Intro>
        {active ? (
          <div className="balance-card">
            <div className="row between">
              <span>
                <Wallet size={17} />
                YOUR AVAILABLE CREDIT
              </span>
              <Sparkles size={20} />
            </div>
            <strong>{money(active.balance)}</strong>
            <p>
              {active.name}
              <ArrowUpRight size={18} />
            </p>
          </div>
        ) : (
          <div className="plans-hero">
            <div>
              <span className="eyebrow">UP TO 20% EXTRA CREDIT</span>
              <h2>
                Freshness.
                <br />
                On repeat.
              </h2>
              <p>Get more credit when you recharge.</p>
            </div>
            <Illustration type="fold" />
          </div>
        )}
        <InfoNote>
          Demo prices. Use credit after pickup and item counting.
        </InfoNote>
        <div className="stack">
          {plans.map((plan) => (
            <PackageCard
              key={plan.id}
              plan={plan}
              active={active?.planId === plan.id}
              onPurchase={() => setSelected(plan)}
            />
          ))}
        </div>
        <p className="micro center">
          Demo credits do not expire. Recharges add to your balance. Apply a
          coupon before plan credit.
        </p>
      </main>
      {selected && (
        <PaymentMethodSheet
          open
          planId={selected.id}
          amount={selected.price}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
