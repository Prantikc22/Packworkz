import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useListTestimonials, useGetCategorySummary } from "@workspace/api-client-react";
import { motion, useInView } from "framer-motion";
import { formatINR } from "@/lib/format";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

const CountUp = ({ end, suffix = "", duration = 2 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    
    let startTime: number;
    const animate = (time: number) => {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / (duration * 1000), 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [inView, end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
};

export default function Home() {
  const { data: testimonials } = useListTestimonials();
  const { data: categories } = useGetCategorySummary();

  const [monthlySpend, setMonthlySpend] = useState([500000]);
  const [vendorCount, setVendorCount] = useState("2-3");
  const [useCredit, setUseCredit] = useState(false);

  const calculateSavings = () => {
    const spend = monthlySpend[0];
    const savingPct = vendorCount === "1" ? 0.08 : vendorCount === "2-3" ? 0.10 : 0.12;
    const annualSaving = spend * 12 * savingPct;
    const creditMarkup = useCredit ? spend * 12 * 0.12 : 0;
    const upfrontSaving = spend * 12 * 0.03;
    const timeSaved = vendorCount === "1" ? 4 : vendorCount === "2-3" ? 8 : 14;
    const totalValue = annualSaving + creditMarkup;

    return { annualSaving, upfrontSaving, timeSaved, totalValue };
  };

  const savings = calculateSavings();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-navy text-white pt-24 pb-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue to-transparent pointer-events-none"></div>
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="max-w-3xl">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-bold leading-tight mb-6"
            >
              India's Most Complete <span className="text-amber">Packaging Platform</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl"
            >
              Source premium packaging with 98% QC pass rate, 48-hour delivery, and net-60 credit for growing brands.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap gap-4"
            >
              <Link href="/quote">
                <Button size="lg" className="bg-amber text-navy hover:bg-amber/90 font-bold px-8 h-14 text-lg rounded-full">
                  Get a Quote
                </Button>
              </Link>
              <Link href="/products">
                <Button size="lg" variant="outline" className="border-white/20 hover:bg-white/10 text-navy bg-white hover:text-navy px-8 h-14 text-lg rounded-full">
                  Browse Catalogue
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-surface border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-navy mb-2">
                <CountUp end={110} suffix="+" />
              </div>
              <div className="text-muted font-medium">Verified SKUs</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-navy mb-2">
                <CountUp end={5000} suffix="+" />
              </div>
              <div className="text-muted font-medium">Brands Served</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-blue mb-2">48hr</div>
              <div className="text-muted font-medium">SmartStock Delivery</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-success mb-2">
                <CountUp end={98} suffix="%" />
              </div>
              <div className="text-muted font-medium">QC Pass Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Calculator Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">Calculate Your Savings</h2>
            <p className="text-muted text-lg">See how much time and money you save by consolidating with Packwerk.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center bg-surface p-8 md:p-12 rounded-3xl border border-border shadow-sm">
            <div className="space-y-8">
              <div>
                <Label className="text-base text-navy font-semibold mb-4 block">Monthly Packaging Spend: {formatINR(monthlySpend[0])}</Label>
                <Slider
                  min={10000}
                  max={5000000}
                  step={10000}
                  value={monthlySpend}
                  onValueChange={setMonthlySpend}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted mt-2">
                  <span>₹10K</span>
                  <span>₹50L+</span>
                </div>
              </div>
              
              <div>
                <Label className="text-base text-navy font-semibold mb-4 block">Current Number of Vendors</Label>
                <div className="flex gap-4">
                  {["1", "2-3", "5+"].map(count => (
                    <Button 
                      key={count}
                      variant={vendorCount === count ? "default" : "outline"}
                      onClick={() => setVendorCount(count)}
                      className={vendorCount === count ? "bg-navy" : ""}
                    >
                      {count}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-border">
                <div>
                  <Label className="text-base text-navy font-semibold block">Need Net-60 Credit?</Label>
                  <p className="text-sm text-muted">Unlock working capital for growth</p>
                </div>
                <Switch checked={useCredit} onCheckedChange={setUseCredit} />
              </div>
            </div>
            
            <div className="bg-navy text-white p-8 rounded-2xl">
              <div className="mb-8">
                <p className="text-blue-300 text-sm font-medium uppercase tracking-wider mb-2">TOTAL VALUE UNLOCKED</p>
                <div className="text-5xl font-bold text-amber">{formatINR(savings.totalValue)}</div>
                <p className="text-sm text-gray-400 mt-2">Annual projected value</p>
              </div>
              
              <div className="space-y-4 border-t border-white/10 pt-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Direct Cost Savings</span>
                  <span className="font-semibold text-lg">{formatINR(savings.annualSaving)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Upfront 3% Discount</span>
                  <span className="font-semibold text-lg">{formatINR(savings.upfrontSaving)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Management Time Saved</span>
                  <span className="font-semibold text-lg text-amber">{savings.timeSaved} hrs/mo</span>
                </div>
              </div>
              
              <Link href="/quote">
                <Button className="w-full mt-8 bg-white text-navy hover:bg-gray-100 font-bold h-12">
                  Start Saving Today
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-navy text-white">
        <div className="container mx-auto px-4 max-w-6xl">
           <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted by India's Best</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials?.map((t) => (
              <div key={t.id} className="bg-white/5 border border-white/10 p-8 rounded-2xl">
                <p className="text-lg italic text-gray-300 mb-6">"{t.quote_text}"</p>
                <div>
                  <div className="font-bold text-amber">{t.company_name}</div>
                  <div className="text-sm text-gray-400">{t.industry} • {t.city}</div>
                </div>
                <div className="mt-6 pt-6 border-t border-white/10 flex justify-between items-center">
                  <span className="text-sm text-gray-400">{t.metric_label}</span>
                  <span className="font-bold text-success">{t.metric_value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
