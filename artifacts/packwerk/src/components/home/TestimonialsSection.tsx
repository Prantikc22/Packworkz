import { useRef } from "react";

const REVIEWS = [
  {
    name: "Arjun Mehta",
    role: "Founder",
    company: "Zestful Foods",
    city: "Mumbai",
    industry: "D2C Snacks",
    stars: 5,
    text: "Switched from 7 vendors to Packworkz in January. We haven't had a single delayed shipment since. The production tracking alone saves me 3 hours a week.",
    metric: "7 vendors → 1 platform",
  },
  {
    name: "Priya Nair",
    role: "Head of Ops",
    company: "Dermatica India",
    city: "Bangalore",
    industry: "Cosmetics D2C",
    stars: 5,
    text: "Our previous vendor was passing defective cartons consistently. Packworkz's pre-dispatch QC caught everything before it reached our 3PL. ₹3.8L saved in Year 1.",
    metric: "₹3.8L saved in Year 1",
  },
  {
    name: "Rajesh Agarwal",
    role: "Supply Chain Director",
    company: "Harvest Organics",
    city: "Ahmedabad",
    industry: "Organic Food",
    stars: 5,
    text: "FSC certified kraft + compostability docs for our UK export buyer — delivered in 14 days. No other vendor came close. Our buyer cleared us on first inspection.",
    metric: "14-day certified delivery",
  },
  {
    name: "Sneha Pillai",
    role: "Co-founder",
    company: "Bloom Skincare",
    city: "Pune",
    industry: "Beauty",
    stars: 5,
    text: "The ₹1,999 design service is insane value. We got print-ready dieline + artwork for our serum box in 4 days. Fully adjusted against our first order.",
    metric: "₹1,999 design. 4-day turnaround.",
  },
  {
    name: "Mohammed Ismail",
    role: "Procurement Lead",
    company: "QuickShip Commerce",
    city: "Hyderabad",
    industry: "E-commerce",
    stars: 5,
    text: "We needed 8 different SKUs for Q4. Packworkz sourced, sampled, and delivered all 8 in under 3 weeks. Our previous record was 10 weeks for 3 SKUs.",
    metric: "8 SKUs in 3 weeks",
  },
  {
    name: "Kavitha Reddy",
    role: "CEO",
    company: "NatureCraft Organics",
    city: "Chennai",
    industry: "Organic FMCG",
    stars: 5,
    text: "Net-30 credit unlocked after 3 orders. This changed our working capital position completely. We now carry 30% more inventory without tying up cash.",
    metric: "Net-30 credit. 3 orders to unlock.",
  },
  {
    name: "Vikram Sodhi",
    role: "Operations Manager",
    company: "Urban Nest Home",
    city: "Delhi",
    industry: "Home Goods",
    stars: 5,
    text: "Our packaging cost per unit dropped 22% in the first quarter. The savings calculator wasn't even accurate — it actually undersold the savings.",
    metric: "22% unit cost reduction",
  },
  {
    name: "Deepika Shah",
    role: "Brand Manager",
    company: "ClearDerm Pharma",
    city: "Surat",
    industry: "Pharmaceutical",
    stars: 5,
    text: "We needed FDA-grade aluminum foil laminate for our US export SKU. Packworkz had a certified manufacturer assigned in 48 hours. No other platform even understood the brief.",
    metric: "US FDA-grade sourcing in 48hrs",
  },
  {
    name: "Anand Kumar",
    role: "Founder",
    company: "Artisan Chai Co.",
    city: "Kolkata",
    industry: "Specialty Beverages",
    stars: 5,
    text: "Custom stand-up pouch with resealable zipper and window for our tea range. MOQ was 500 units — exactly what we needed as a small brand. No minimums pushed on us.",
    metric: "500 unit MOQ. Custom window pouch.",
  },
  {
    name: "Ritika Joshi",
    role: "Supply Chain Head",
    company: "EcoWear India",
    city: "Jaipur",
    industry: "Sustainable Fashion",
    stars: 5,
    text: "All 3 of our packaging SKUs now have full EPR documentation. Packworkz handled registration, tonnage calculation, and certificates. We sailed through our last compliance audit.",
    metric: "EPR compliance. Zero audit issues.",
  },
  {
    name: "Suresh Patil",
    role: "Managing Director",
    company: "Spice Route Foods",
    city: "Nagpur",
    industry: "FMCG Exports",
    stars: 5,
    text: "We export to UAE and Saudi. Packworkz gave us SASO-ready paperwork with every order, pre-formatted. Our Dubai distributor told us we were the easiest Indian brand to clear customs.",
    metric: "SASO-ready docs. Zero customs delays.",
  },
  {
    name: "Nandita Roy",
    role: "DTC Growth Lead",
    company: "PurePet Foods",
    city: "Bhopal",
    industry: "Pet FMCG",
    stars: 5,
    text: "Compostable pouches for our dog treat range. We weren't sure if it was viable at our scale (2,000 units/month). Packworkz sourced a manufacturer who said yes without MOQ compromise.",
    metric: "Compostable. 2,000 unit/month scale.",
  },
];

const ROW_1 = REVIEWS.slice(0, 6);
const ROW_2 = REVIEWS.slice(6, 12);

function StarRow({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5 mb-3">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#E8A838">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: typeof REVIEWS[0] }) {
  return (
    <div
      className="review-card flex-shrink-0 p-5 rounded-xl"
      style={{
        width: 300,
        background: "white",
        border: "1px solid #E2EAF4",
        borderTop: "3px solid #E8A838",
        boxShadow: "0 2px 12px rgba(13,27,42,0.06)",
        cursor: "default",
      }}
    >
      <StarRow count={review.stars} />
      <p className="text-sm leading-relaxed mb-4" style={{ color: "#374151", lineHeight: 1.65 }}>
        "{review.text}"
      </p>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-bold text-sm" style={{ color: "#0D1B2A" }}>{review.name}</p>
          <p className="text-xs" style={{ color: "#94A3B8" }}>{review.role}, {review.company} · {review.city}</p>
        </div>
      </div>
      <div className="mt-3 px-2.5 py-1.5 rounded-full inline-block" style={{ background: "rgba(232,168,56,0.1)" }}>
        <span className="text-xs font-bold" style={{ color: "#E8A838" }}>{review.metric}</span>
      </div>
    </div>
  );
}

function MarqueeRow({ reviews, direction = "left", speed = 40 }: { reviews: typeof REVIEWS; direction?: "left" | "right"; speed?: number }) {
  const trackRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (trackRef.current) trackRef.current.style.animationPlayState = "paused";
  };
  const handleMouseLeave = () => {
    if (trackRef.current) trackRef.current.style.animationPlayState = "running";
  };

  const doubled = [...reviews, ...reviews];
  const animName = direction === "left" ? "marqueeLeft" : "marqueeRight";

  return (
    <div style={{ overflow: "hidden" }}>
      <div
        ref={trackRef}
        className="flex gap-4"
        style={{
          width: "max-content",
          animation: `${animName} ${speed}s linear infinite`,
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {doubled.map((review, i) => (
          <ReviewCard key={i} review={review} />
        ))}
      </div>
    </div>
  );
}

export default function TestimonialsSection() {
  return (
    <section className="py-24 overflow-hidden" style={{ background: "#F8F9FC" }}>
      <div className="max-w-7xl mx-auto px-8 md:px-20 mb-12">
        <p className="font-bold tracking-[0.25em] text-xs uppercase mb-4" style={{ color: "#1B6CA8" }}>WHAT BRANDS SAY</p>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <h2 className="clash-display" style={{ color: "#0D1B2A", fontSize: "clamp(2rem,4vw,3rem)", lineHeight: 1.1 }}>
            Used by India's fastest<br />growing brands.
          </h2>
          <div className="flex gap-12">
            {[
              { val: "₹2.4Cr+", cap: "Annual savings generated" },
              { val: "1,200+", cap: "Orders delivered on time" },
              { val: "98.7%", cap: "QC first-pass rate" },
            ].map((s) => (
              <div key={s.val} className="text-center md:text-right">
                <p className="clash-display" style={{ color: "#0D1B2A", fontSize: 28, lineHeight: 1 }}>{s.val}</p>
                <p className="text-xs mt-1" style={{ color: "#94A3B8" }}>{s.cap}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes marqueeLeft {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes marqueeRight {
          from { transform: translateX(-50%); }
          to { transform: translateX(0); }
        }
        .review-card {
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .review-card:hover {
          box-shadow: 0 8px 32px rgba(13,27,42,0.12);
          transform: translateY(-2px);
        }
      `}</style>

      <div className="flex flex-col gap-5">
        <MarqueeRow reviews={ROW_1} direction="left" speed={45} />
        <MarqueeRow reviews={ROW_2} direction="right" speed={50} />
      </div>

      <p className="text-center text-xs mt-10" style={{ color: "#94A3B8" }}>
        Hover over any card to pause and read · Verified brand partners
      </p>
    </section>
  );
}
