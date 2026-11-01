import { useState } from "react";
import {
  Alert,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Radio,
} from "@mui/material";
import {
  Building2,
  CheckCircle2,
  CreditCard,
  Smartphone,
  X,
} from "lucide-react";
import { ErrorMessage, PrimaryButton } from "../../components/common/ui";
import { useAsync } from "../../hooks/useAsync";
import { money } from "../../utils/format";
import { paymentService } from "../../services/paymentService";
export function PaymentMethodSheet({
  open,
  onClose,
  amount,
  orderId,
  planId,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  amount: number;
  orderId?: string;
  planId?: string;
  onSuccess?: () => void;
}) {
  const [method, setMethod] = useState("UPI");
  const [fail, setFail] = useState(false);
  const [success, setSuccess] = useState(false);
  const { loading, error, run } = useAsync();
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      className="payment-dialog"
    >
      <DialogTitle className="row between">
        {success ? "Payment complete" : "Choose payment method"}
        <IconButton
          disabled={loading}
          aria-label="Close payment"
          onClick={onClose}
        >
          <X size={20} />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <div className="stack">
          {success ? (
            <>
              <div className="payment-success">
                <CheckCircle2 size={54} />
                <h2>Payment complete</h2>
                <p>{money(amount)} paid · demo</p>
              </div>
              <Alert severity="info">
                Demo only. No real money charged.
              </Alert>
              <PrimaryButton
                onClick={() => {
                  onClose();
                  onSuccess?.();
                }}
              >
                Done
              </PrimaryButton>
            </>
          ) : (
            <>
              <div className="payment-amount">
                <span>Total to pay</span>
                <strong>{money(amount)}</strong>
              </div>
              {[
                {
                  name: "UPI",
                  text: "Google Pay, PhonePe, or another UPI app",
                  Icon: Smartphone,
                },
                {
                  name: "Credit / debit card",
                  text: "Visa, Mastercard, RuPay",
                  Icon: CreditCard,
                },
                {
                  name: "Net banking",
                  text: "Pay through your bank",
                  Icon: Building2,
                },
              ].map(({ name, text, Icon }) => (
                <button
                  key={name}
                  disabled={loading}
                  className={`payment-option ${method === name ? "selected" : ""}`}
                  onClick={() => setMethod(name)}
                >
                  <Icon size={23} />
                  <span>
                    <strong>{name}</strong>
                    <small>{text}</small>
                  </span>
                  <Radio checked={method === name} tabIndex={-1} />
                </button>
              ))}
              <Alert severity="info">
                Demo only. No bank or card details are collected.
              </Alert>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={fail}
                    onChange={(_, v) => setFail(v)}
                    disabled={loading}
                  />
                }
                label="Test declined payment"
              />
              <ErrorMessage message={error} />
              <PrimaryButton
                loading={loading}
                onClick={() =>
                  run(
                    () =>
                      orderId
                        ? paymentService.pay(orderId, method, fail)
                        : paymentService.activate(planId!, method, fail),
                    () => setSuccess(true),
                  )
                }
              >
                Pay {money(amount)} · demo
              </PrimaryButton>
              <Button onClick={onClose} disabled={loading}>
                Cancel
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
