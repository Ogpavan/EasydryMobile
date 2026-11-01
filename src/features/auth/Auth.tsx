import { useEffect, useRef, useState } from "react";
import { Alert, Button, InputAdornment, LinearProgress } from "@mui/material";
import {
  ArrowRight,
  Check,
  ShieldCheck,
  Truck,
  Sparkles,
  Clock3,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAppStore } from "../../store/appStore";
import { Brand, TopAppBar } from "../../components/navigation/Navigation";
import { Illustration } from "../../components/cards/cards";
import {
  ErrorMessage,
  FormField,
  PrimaryButton,
} from "../../components/common/ui";
import { authService, DEMO_OTP } from "../../services/authService";
import { useAsync } from "../../hooks/useAsync";
export function Splash() {
  const navigate = useNavigate();
  const { onboarded, authenticated } = useAppStore();
  useEffect(() => {
    const timer = setTimeout(
      () =>
        navigate(
          authenticated ? "/home" : onboarded ? "/login" : "/onboarding",
          { replace: true },
        ),
      1100,
    );
    return () => clearTimeout(timer);
  }, [navigate, onboarded, authenticated]);
  return (
    <div className="splash">
      <Brand large />
      <Illustration />
      <h2>
        Clean clothes.
        <br />More free time.
      </h2>
      <p>Easy pickup and delivery.</p>
      <LinearProgress sx={{ width: 70, height: 3, borderRadius: 2, mt: 4 }} />
      <span className="splash-foot">PICKUP AND DELIVERY</span>
    </div>
  );
}
const slides = [
  {
    eyebrow: "1 / PICKUP",
    title: "We pick up<br/>from your door.",
    description: "Choose a time that works for you.",
    Icon: Truck,
    type: "scooter" as const,
  },
  {
    eyebrow: "2 / CLEANING",
    title: "We clean<br/>with care.",
    description: "We count items after pickup.",
    Icon: Sparkles,
    type: "dry" as const,
  },
  {
    eyebrow: "3 / DELIVERY",
    title: "Clean clothes,<br/>back at your door.",
    description: "Track your order in the app.",
    Icon: Clock3,
    type: "fold" as const,
  },
];
export function Onboarding() {
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();
  const complete = useAppStore((s) => s.completeOnboarding);
  const finish = () => {
    complete();
    navigate("/login", { replace: true });
  };
  const slide = slides[index];
  return (
    <div className="onboarding">
      <div className="row between">
        <Brand />
        <Button onClick={finish}>Skip</Button>
      </div>
      <div className="onboarding-art" data-service={slide.type}>
        <span className="art-orbit" />
        <Illustration type={slide.type} />
        <div className="floating-badge">
          <slide.Icon size={19} />
          {index === 0
            ? "Pickup at your door"
            : index === 1
              ? "Expert fabric care"
              : "Home delivery"}
          <Check size={14} />
        </div>
      </div>
      <span className="eyebrow">{slide.eyebrow}</span>
      <h1 dangerouslySetInnerHTML={{ __html: slide.title }} />
      <p>{slide.description}</p>
      <div className="slide-dots">
        {slides.map((_, i) => (
          <button
            key={i}
            className={i === index ? "active" : ""}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
      <PrimaryButton
        endIcon={<ArrowRight size={18} />}
        onClick={() => (index === 2 ? finish() : setIndex(index + 1))}
      >
        {index === 2 ? "Get started" : "Next"}
      </PrimaryButton>
      <span className="auth-foot">PICKUP · CLEANING · DELIVERY</span>
    </div>
  );
}
const phoneSchema = z.object({
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number."),
});
export function Login() {
  const navigate = useNavigate();
  const { run, loading, error } = useAsync();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof phoneSchema>>({
    resolver: zodResolver(phoneSchema),
  });
  return (
    <>
      <TopAppBar title="Welcome to EasyDry" back={false} />
      <main className="page auth-page">
        <Brand large />
        <div className="auth-art">
          <Illustration />
        </div>
        <span className="eyebrow">SIGN IN</span>
        <h1>
          Sign in with
          <br />
          your mobile number.
        </h1>
        <p className="muted">
          We’ll send you a 6-digit code.
        </p>
        <form
          className="stack"
          onSubmit={handleSubmit(({ phone }) =>
            run(
              () => authService.sendOtp(phone),
              () => navigate("/verify", { state: { phone } }),
            ),
          )}
        >
          <FormField
            label="Mobile number"
            autoComplete="tel-national"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">+91</InputAdornment>
                ),
              },
              htmlInput: { inputMode: "numeric", maxLength: 10 },
            }}
            {...register("phone")}
            error={!!errors.phone}
            helperText={errors.phone?.message}
          />
          <ErrorMessage message={error} />
          <PrimaryButton
            type="submit"
            loading={loading}
            endIcon={<ArrowRight size={18} />}
          >
            Continue with OTP
          </PrimaryButton>
        </form>
        <p className="legal-text">
          By continuing, you agree to our
          <br />
          <Link to="/legal/terms">Terms & Conditions</Link> and{" "}
          <Link to="/legal/privacy">Privacy Policy</Link>.
        </p>
        <div className="auth-security">
          <ShieldCheck size={16} />
          Your number stays private.
        </div>
        <Alert severity="info" className="demo-notice">
          Demo sign-in · use any valid Indian mobile number. Verification code:{" "}
          <strong>123456</strong>.
        </Alert>
      </main>
    </>
  );
}
export function OTP({ phone }: { phone: string }) {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [count, setCount] = useState(30);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const login = useAppStore((s) => s.login);
  const { loading, error, run, setError } = useAsync();
  useEffect(() => {
    if (count === 0) return;
    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count]);
  const change = (i: number, value: string) => {
    const v = value.replace(/\D/g, "");
    setError("");
    if (v.length > 1) {
      const start = v.length === 6 ? 0 : i;
      setDigits((old) => {
        const copy = [...old];
        for (let offset = 0; offset < v.length && start + offset < 6; offset++)
          copy[start + offset] = v[offset];
        return copy;
      });
      inputs.current[Math.min(start + v.length, 5)]?.focus();
      return;
    }
    setDigits((old) => {
      const copy = [...old];
      copy[i] = v.slice(-1);
      return copy;
    });
    if (v && i < 5) inputs.current[i + 1]?.focus();
  };
  return (
    <>
      <TopAppBar title="Verify your number" />
      <main className="page otp-page">
        <div className="auth-symbol">
          <ShieldCheck size={34} />
        </div>
        <span className="eyebrow">VERIFY NUMBER</span>
        <h1>
          Enter the code
          <br />
          we sent you.
        </h1>
        <p className="muted">
          Enter the 6-digit code sent to
          <br />
          <strong>+91 {phone}</strong> <Link to="/login">Change</Link>
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void run(
              () => authService.verifyOtp(phone, digits.join("")),
              () => {
                login(phone);
                navigate("/home", { replace: true });
              },
            );
          }}
        >
          <div
            className="otp-inputs"
            onPaste={(e) => {
              e.preventDefault();
              setError("");
              const value = e.clipboardData
                .getData("text")
                .replace(/\D/g, "")
                .slice(0, 6);
              setDigits(Array.from({ length: 6 }, (_, i) => value[i] ?? ""));
              inputs.current[Math.min(value.length, 5)]?.focus();
            }}
          >
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputs.current[i] = el;
                }}
                aria-label={`Verification digit ${i + 1}`}
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete={i === 0 ? "one-time-code" : "off"}
                value={d}
                maxLength={6}
                disabled={loading}
                onFocus={(e) => e.currentTarget.select()}
                autoFocus={i === 0}
                onChange={(e) => change(i, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && !d && i > 0)
                    inputs.current[i - 1]?.focus();
                  if (e.key === "ArrowLeft" && i > 0)
                    inputs.current[i - 1]?.focus();
                  if (e.key === "ArrowRight" && i < 5)
                    inputs.current[i + 1]?.focus();
                }}
              />
            ))}
          </div>
          <ErrorMessage message={error} />
          <PrimaryButton
            type="submit"
            loading={loading}
            disabled={digits.join("").length !== 6}
          >
            Verify & continue
          </PrimaryButton>
        </form>
        <div className="resend">
          Didn’t receive a code?{" "}
          <Button
            disabled={count > 0 || loading}
            onClick={() =>
              run(
                () => authService.sendOtp(phone),
                () => setCount(30),
              )
            }
          >
            {count > 0 ? `Resend in ${count}s` : "Resend code"}
          </Button>
        </div>
        <Alert severity="info">
          This is a demo. Enter <strong>{DEMO_OTP}</strong>. No SMS is sent.
          <Button
            disabled={loading}
            onClick={() =>
              run(
                () => authService.sendOtp(phone),
                () => {
                  setDigits(DEMO_OTP.split(""));
                  setCount(30);
                  inputs.current[5]?.focus();
                },
              )
            }
          >
            Fill demo code
          </Button>
        </Alert>
      </main>
    </>
  );
}
