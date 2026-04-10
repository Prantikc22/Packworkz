import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/format";
import { CheckCircle2 } from "lucide-react";

export default function Samples() {
  const tiers = [
    {
      name: "Standard Sample",
      price: 2999,
      features: [
        "Unprinted physical sample",
        "Exact size and structure",
        "Standard materials",
        "Dispatched in 3-5 days",
        "Cost fully adjusted against bulk order"
      ]
    },
    {
      name: "Premium Sample",
      price: 4999,
      isPopular: true,
      features: [
        "Digitally printed with your artwork",
        "Exact size and structure",
        "Premium materials & finishes",
        "Dispatched in 5-7 days",
        "Cost fully adjusted against bulk order"
      ]
    },
    {
      name: "Complex Sample",
      price: 7999,
      features: [
        "Fully customized structure",
        "Offset printed with your artwork",
        "All specialized finishes (foil, spot UV)",
        "Dispatched in 10-14 days",
        "Cost fully adjusted against bulk order"
      ]
    }
  ];

  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      <div className="text-center mb-16 max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-navy mb-6">Feel the Quality Before You Commit</h1>
        <p className="text-xl text-muted">We highly recommend getting a physical sample to test your product fit, structural integrity, and finish quality before bulk production.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-16">
        {tiers.map((tier, i) => (
          <div key={i} className={`relative bg-white rounded-3xl p-8 border ${tier.isPopular ? 'border-amber shadow-lg' : 'border-border shadow-sm'}`}>
            {tier.isPopular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber text-navy font-bold text-sm px-4 py-1 rounded-full uppercase tracking-wider">
                Most Popular
              </div>
            )}
            <div className="text-center mb-8 border-b border-border pb-8">
              <h3 className="text-2xl font-bold text-navy mb-2">{tier.name}</h3>
              <div className="text-4xl font-bold text-blue mb-2">{formatINR(tier.price)}</div>
              <p className="text-sm text-success font-medium">100% Refundable on bulk order</p>
            </div>
            <ul className="space-y-4 mb-8">
              {tier.features.map((feature, j) => (
                <li key={j} className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-success mr-3 shrink-0" />
                  <span className="text-muted">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="bg-surface rounded-3xl p-8 md:p-12 text-center border border-border">
        <h2 className="text-3xl font-bold text-navy mb-4">How to Order a Sample?</h2>
        <p className="text-lg text-muted mb-8 max-w-2xl mx-auto">Samples are requested directly from the product page or during the quote request process. Find your desired packaging style to begin.</p>
        <Link href="/products">
          <Button size="lg" className="bg-navy text-white hover:bg-blue font-bold px-8 h-14 rounded-full text-lg">
            Browse Catalogue
          </Button>
        </Link>
      </div>
    </div>
  );
}
