import { useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Button,
  MenuItem,
} from "@mui/material";
import {
  ChevronDown,
  MessageCircle,
  Mail,
  Send,
  CheckCircle2,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { TopAppBar } from "../../components/navigation/Navigation";
import {
  FormField,
  Intro,
  PrimaryButton,
  SectionHeader,
  ErrorMessage,
} from "../../components/common/ui";
import { useAppStore } from "../../store/appStore";
import { useAsync } from "../../hooks/useAsync";
import { mockApi } from "../../services/mockApi";
const schema = z.object({
  subject: z.string().trim().min(4, "Add a short subject.").max(100),
  message: z
    .string()
    .trim()
    .min(15, "Enter at least 15 characters.")
    .max(1500),
  reference: z.string(),
});
const faq = [
  [
    "How does EasyDry work?",
    "Choose a service, time and address. We count your items after pickup, then add the bill to My Orders.",
  ],
  [
    "Do I need to count my clothes first?",
    "No. We count your items after pickup.",
  ],
  [
    "When will my clothes be delivered?",
    "Standard cleaning takes 48–72 hours. Express takes 24 hours in this demo. Track it in My Orders.",
  ],
  [
    "How do laundry plan credits work?",
    "Buy a demo plan to add credit. Apply a coupon first, then use credit to pay an order. Unused credit stays in your account.",
  ],
  [
    "Can I change or cancel a pickup?",
    "Yes, while it’s scheduled. Go to My Requests to change or cancel it.",
  ],
  [
    "Are the payments real?",
    "No. Sign-in, prices and payments are simulated. No real pickup or delivery is made.",
  ],
];
export default function Support() {
  const [params] = useSearchParams();
  const { requests, orders, createTicket, tickets } = useAppStore();
  const [ticketId, setTicketId] = useState("");
  const [contact, setContact] = useState(false);
  const { loading, error, run } = useAsync();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      reference: params.get("reference") ?? "",
      subject: "",
      message: "",
    },
  });
  return (
    <>
      <TopAppBar title="Help & support" />
      <main className="page">
        <div className="support-heading">
          <span className="support-symbol">
            <MessageCircle size={29} />
          </span>
          <Intro title="How can we help?">
            Find answers or send us a message.
          </Intro>
        </div>
        <div className="support-options">
          <button className="panel" onClick={() => setContact(!contact)}>
            <MessageCircle size={23} />
            <strong>WhatsApp</strong>
            <small>Contact support</small>
          </button>
          <button
            className="panel"
            onClick={() =>
              document
                .getElementById("support-form")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            <Mail size={23} />
            <strong>Write to us</strong>
            <small>Send a message</small>
          </button>
        </div>
        {contact && (
          <Alert severity="info">
            WhatsApp support is not set up yet. Use the form below.
          </Alert>
        )}
        <SectionHeader title="FAQs" />
        <div className="faq-list">
          {faq.map(([q, a]) => (
            <Accordion key={q} disableGutters elevation={0}>
              <AccordionSummary expandIcon={<ChevronDown size={18} />}>
                <strong>{q}</strong>
              </AccordionSummary>
              <AccordionDetails>{a}</AccordionDetails>
            </Accordion>
          ))}
        </div>
        <SectionHeader title="Send us a message" />
        {ticketId ? (
          <Alert severity="success" icon={<CheckCircle2 />}>
            Ticket {ticketId} saved on this device. It was not sent.
            <Button onClick={() => setTicketId("")}>Create another</Button>
          </Alert>
        ) : (
          <form
            id="support-form"
            className="stack"
            onSubmit={handleSubmit((values) =>
              run(
                () => mockApi(() => createTicket(values)),
                (id) => {
                  setTicketId(id);
                  reset({ subject: "", message: "", reference: "" });
                },
              ),
            )}
          >
            <FormField
              select
              label="Related pickup or order (optional)"
              defaultValue={params.get("reference") ?? ""}
              {...register("reference")}
            >
              <MenuItem value="">General enquiry</MenuItem>
              {[...requests.map((x) => x.id), ...orders.map((x) => x.id)].map(
                (id) => (
                  <MenuItem key={id} value={id}>
                    {id}
                  </MenuItem>
                ),
              )}
            </FormField>
            <FormField
              label="Subject"
              {...register("subject")}
              error={!!errors.subject}
              helperText={errors.subject?.message}
            />
            <FormField
              label="How can we help?"
              multiline
              minRows={4}
              {...register("message")}
              error={!!errors.message}
              helperText={errors.message?.message}
            />
            <ErrorMessage message={error} />
            <PrimaryButton
              type="submit"
              loading={loading}
              endIcon={<Send size={17} />}
            >
              Send message
            </PrimaryButton>
            <p className="micro">
              Messages are saved on this device only.
            </p>
          </form>
        )}
        {tickets.length > 0 && (
          <>
            <SectionHeader title="Your demo tickets" />
            {tickets.map((t) => (
              <div key={t.id} className="panel ticket-row">
                <div>
                  <strong>{t.subject}</strong>
                  <small>
                    {t.id}
                    {t.reference ? ` · ${t.reference}` : ""}
                  </small>
                </div>
                <span className="micro">Saved locally</span>
              </div>
            ))}
          </>
        )}
      </main>
    </>
  );
}
