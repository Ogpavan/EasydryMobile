import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { Plus, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { TopAppBar } from "../../components/navigation/Navigation";
import { AddressCard } from "../../components/cards/cards";
import {
  ConfirmationDialog,
  EmptyState,
  ErrorMessage,
  FormField,
  InfoNote,
  Intro,
  PrimaryButton,
  StickyAction,
} from "../../components/common/ui";
import { useAppStore } from "../../store/appStore";
import { BookingSteps } from "./Booking";
import type { Address } from "../../types";
import { uid } from "../../utils/format";
import { useAsync } from "../../hooks/useAsync";
import { bookingService } from "../../services/bookingService";
const addressSchema = z.object({
  label: z.string().trim().min(2, "Enter a label, such as Home.").max(24),
  contact: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit number."),
  street: z.string().trim().min(5, "Enter your building and street.").max(120),
  area: z.string().trim().min(2).max(80),
  city: z.string().trim().min(2).max(60),
  state: z.string().trim().min(2).max(60),
  pincode: z.string().regex(/^[1-9]\d{5}$/, "Enter a valid 6-digit pincode."),
});
type Fields = z.infer<typeof addressSchema>;
function AddressForm({
  address,
  onClose,
}: {
  address: Partial<Address>;
  onClose: () => void;
}) {
  const add = useAppStore((s) => s.addAddress);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Fields>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: address.label ?? "Home",
      contact: address.contact ?? "",
      street: address.street ?? "",
      area: address.area ?? "",
      city: address.city ?? "",
      state: address.state ?? "",
      pincode: address.pincode ?? "",
    },
  });
  return (
    <Dialog open onClose={onClose}>
      <DialogTitle>
        {address.id ? "Edit address" : "Add a new address"}
      </DialogTitle>
      <form
        onSubmit={handleSubmit((values) => {
          add({ ...values, id: address.id ?? uid("ADDR") });
          onClose();
        })}
      >
        <DialogContent className="stack address-form">
          {(
            [
              "label",
              "contact",
              "street",
              "area",
              "city",
              "state",
              "pincode",
            ] as const
          ).map((name) => (
            <FormField
              key={name}
              label={
                {
                  label: "Address label",
                  contact: "Contact number",
                  street: "Building, flat & street",
                  area: "Area / locality",
                  city: "City",
                  state: "State",
                  pincode: "Pincode",
                }[name]
              }
              {...register(name)}
              error={!!errors[name]}
              helperText={errors[name]?.message}
              slotProps={{
                htmlInput: {
                  inputMode:
                    name === "contact" || name === "pincode"
                      ? "numeric"
                      : "text",
                  maxLength:
                    name === "contact" ? 10 : name === "pincode" ? 6 : 120,
                },
              }}
            />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            Save address
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
export default function Addresses({ booking = false }: { booking?: boolean }) {
  const {
    addresses,
    draft,
    updateDraft,
    deleteAddress,
    profile,
    preferredAddressId,
    setPreferredAddress,
  } = useAppStore();
  const [editing, setEditing] = useState<Partial<Address> | null>(null);
  const [deleting, setDeleting] = useState("");
  const navigate = useNavigate();
  const { run, error, loading } = useAsync();
  return (
    <>
      <TopAppBar title={booking ? "Pickup address" : "Your addresses"} />
      {booking && <BookingSteps step={2} />}
      <main className={`page ${booking ? "action-page" : ""}`}>
        <Intro
          title={
            booking ? "Where should we pick up?" : "Saved addresses"
          }
        >
          {booking
            ? "Choose an address or add a new one."
            : "Manage your pickup addresses."}
        </Intro>
        <div className="stack">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              selected={
                (booking ? draft.addressId : preferredAddressId) === address.id
              }
              onSelect={() =>
                booking
                  ? updateDraft({ addressId: address.id })
                  : setPreferredAddress(address.id)
              }
              onEdit={() => setEditing(address)}
              onDelete={() => setDeleting(address.id)}
            />
          ))}
        </div>
        {!addresses.length && (
          <EmptyState
            title="No saved addresses"
            description="Add an address for pickup."
          />
        )}
        <Button
          className="add-address"
          fullWidth
          variant="outlined"
          startIcon={<Plus size={18} />}
          onClick={() => setEditing({ contact: profile.phone })}
        >
          Add new address
        </Button>
        {booking && (
          <>
            <InfoNote>
              We’ll share the final price after pickup.
            </InfoNote>
            <ErrorMessage message={error} />
          </>
        )}
      </main>
      {booking && (
        <StickyAction>
          <PrimaryButton
            loading={loading}
            disabled={
              !draft.addressId ||
              !addresses.some((a) => a.id === draft.addressId) ||
              !draft.date ||
              !draft.slot ||
              !draft.services.length
            }
            onClick={() =>
              run(
                () => bookingService.confirm(),
                (id) => navigate(`/booking/confirmed/${id}`, { replace: true }),
              )
            }
            endIcon={<ArrowRight size={18} />}
          >
            Confirm pickup
          </PrimaryButton>
          <p className="micro center">No payment needed now</p>
        </StickyAction>
      )}
      {editing && (
        <AddressForm address={editing} onClose={() => setEditing(null)} />
      )}
      <ConfirmationDialog
        open={!!deleting}
        title="Delete this address?"
        danger
        confirmLabel="Delete address"
        onClose={() => setDeleting("")}
        onConfirm={() => {
          deleteAddress(deleting);
          setDeleting("");
        }}
      >
        Existing pickups will keep this address. It will be removed from your
        saved addresses.
      </ConfirmationDialog>
    </>
  );
}
