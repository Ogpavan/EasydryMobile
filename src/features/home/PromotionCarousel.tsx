import { useCallback, useEffect, useState } from "react";
import { Button } from "@mui/material";
import { ArrowRight, Sparkles, Truck } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { Link } from "react-router-dom";
import { Illustration } from "../../components/cards/cards";

const slides = [
  {
    eyebrow: "PICKUP & DELIVERY",
    title: "Laundry picked up.",
    description: "Choose a time. We’ll collect at your door.",
    action: "Book pickup",
    to: "/booking/services",
    art: "scooter" as const,
    Icon: Truck,
    theme: "blue",
  },
  {
    eyebrow: "FABRIC CARE",
    title: "Cleaned with care.",
    description: "We count items and set the price after pickup.",
    action: "Our services",
    to: "/booking/services",
    art: "iron" as const,
    Icon: Sparkles,
    theme: "light",
  },
];

export function PromotionCarousel() {
  const [viewportRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: true,
    dragFree: false,
  });
  const [selected, setSelected] = useState(0);

  const updateSelected = useCallback(() => {
    if (emblaApi) setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", updateSelected);
    emblaApi.on("reInit", updateSelected);
    return () => {
      emblaApi.off("select", updateSelected);
      emblaApi.off("reInit", updateSelected);
    };
  }, [emblaApi, updateSelected]);

  return (
    <section
      className="promo-carousel"
      role="region"
      aria-roledescription="carousel"
      aria-label="EasyDry offers and services"
    >
      <div className="promo-viewport" ref={viewportRef}>
        <div className="promo-track">
          {slides.map(
            (
              { eyebrow, title, description, action, to, art, Icon, theme },
              index,
            ) => (
              <article
                className={`promo-slide promo-slide--${theme}`}
                key={title}
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${slides.length}`}
              >
                <div className="promo-copy">
                  <span className="promo-eyebrow">
                    <Icon size={13} aria-hidden="true" />
                    {eyebrow}
                  </span>
                  <h2>{title}</h2>
                  <p>{description}</p>
                  <Button
                    component={Link}
                    to={to}
                    variant="contained"
                    endIcon={<ArrowRight size={15} />}
                  >
                    {action}
                  </Button>
                </div>
                <Illustration className="promo-art" type={art} />
              </article>
            ),
          )}
        </div>
      </div>
      <div className="promo-dots" role="group" aria-label="Choose a promotion">
        {slides.map((slide, index) => (
          <button
            key={slide.title}
            type="button"
            className={index === selected ? "active" : ""}
            aria-label={`Show slide ${index + 1} of ${slides.length}`}
            aria-pressed={index === selected}
            onClick={() => emblaApi?.scrollTo(index)}
          />
        ))}
      </div>
    </section>
  );
}
