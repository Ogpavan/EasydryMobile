import {
  ArrowRight,
  ChevronDown,
  MapPin,
  CalendarPlus,
  ShieldCheck,
  Tag,
  Truck,
} from "lucide-react";
import { Button } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useAppStore } from "../../store/appStore";
import {
  Brand,
  NotificationButton,
} from "../../components/navigation/Navigation";
import { ServiceCard } from "../../components/cards/cards";
import { SectionHeader } from "../../components/common/ui";
import { services } from "../../services/catalog";
import { PromotionCarousel } from "./PromotionCarousel";
export default function Home() {
  const navigate = useNavigate();
  const {
    addresses,
    updateDraft,
    preferredAddressId,
  } = useAppStore();
  const location =
    addresses.find((a) => a.id === preferredAddressId) ?? addresses[0];
  return (
    <main className="home-page">
      <header className="home-appbar">
        <Brand />
        <div className="home-header-actions">
          <Link className="location-selector" to="/addresses">
            <MapPin size={15} />
            <strong>{location?.area ?? "Add address"}</strong>
            <ChevronDown size={14} />
          </Link>
          <span className="home-header-divider" aria-hidden="true" />
          <NotificationButton />
        </div>
      </header>
      <div className="home-content">
        <PromotionCarousel />
        <div className="trust-strip">
          <span>
            <Truck size={16} />
            Doorstep pickup
          </span>
          <i />
          <span>
            <ShieldCheck size={16} />
            Care for every fabric
          </span>
        </div>
        <SectionHeader
          title="Our services"
          action="View all"
          to="/booking/services"
        />
        <div className="service-grid">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              id={service.id}
              compact
              onClick={() => {
                updateDraft({ services: [service.id] });
                navigate("/booking/services");
              }}
            />
          ))}
        </div>
        <Button
          component={Link}
          to="/booking/services"
          variant="contained"
          className="schedule-cta"
          fullWidth
          startIcon={<CalendarPlus size={20} />}
          endIcon={<ArrowRight size={19} />}
        >
          Schedule a pickup
        </Button>
        <div className="pickup-caption">
          No need to count items. Book a pickup.
        </div>
        <div className="home-bottom-links">
          <Link to="/offers">
            <Tag size={16} />
            Offers & coupons
          </Link>
          <Link to="/support">
            Here to help
            <ArrowRight size={15} />
          </Link>
        </div>
        <footer className="home-footer">
          <Brand />
          <p>Pickup, cleaning and delivery.</p>
          <span>LAUNDRY CARE MADE EASY</span>
        </footer>
      </div>
    </main>
  );
}
