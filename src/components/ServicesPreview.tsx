import { FileText, Heart, Landmark, ScrollText, Bell, GraduationCap, Lightbulb } from "lucide-react";

const services = [
  { icon: FileText, label: "Licenses", color: "text-primary" },
  { icon: Landmark, label: "Tax", color: "text-primary" },
  { icon: Lightbulb, label: "Utilities", color: "text-primary" },
  { icon: Heart, label: "Health", color: "text-primary" },
  { icon: Bell, label: "Announcements", color: "text-primary" },
  { icon: GraduationCap, label: "Education", color: "text-primary" },
];

const ServicesPreview = () => (
  <section className="bg-background py-16">
    <div className="container mx-auto px-4">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Public Services */}
        <div className="card-gov p-6">
          <h3 className="section-title mb-6">Public Services</h3>
          <div className="grid grid-cols-3 gap-4">
            {services.slice(0, 3).map((s) => (
              <button key={s.label} className="flex flex-col items-center gap-2 rounded-xl bg-muted p-4 transition-all hover:bg-accent hover:shadow-sm">
                <s.icon className={`h-8 w-8 ${s.color}`} />
                <span className="text-sm font-medium text-foreground">{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Announcements */}
        <div className="card-gov p-6">
          <h3 className="section-title mb-6">Latest Announcements & Notices</h3>
          <div className="space-y-4">
            {[
              { title: "PM-KISAN 17th Installment Released", date: "Feb 2026" },
              { title: "Ayushman Bharat expansion to cover 50 cr citizens", date: "Jan 2026" },
              { title: "Digital India 3.0 initiative launched", date: "Dec 2025" },
            ].map((n) => (
              <div key={n.title} className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
                <Bell className="mt-0.5 h-4 w-4 text-secondary shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">{n.title}</p>
                  <p className="text-xs text-muted-foreground">{n.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Government Schemes */}
        <div className="card-gov p-6">
          <h3 className="section-title mb-6">Government Schemes & Programs</h3>
          <div className="space-y-3">
            {[
              { name: "PM-KISAN Samman Nidhi", desc: "₹6,000/year direct benefit transfer" },
              { name: "Ayushman Bharat - PMJAY", desc: "₹5 lakh health insurance cover" },
              { name: "PM Awas Yojana", desc: "Affordable housing for all" },
            ].map((scheme) => (
              <div key={scheme.name} className="rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors cursor-pointer">
                <p className="text-sm font-semibold text-foreground">{scheme.name}</p>
                <p className="text-xs text-muted-foreground">{scheme.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Citizen Support */}
        <div className="card-gov p-6">
          <h3 className="section-title mb-6">Citizen Support</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="text-sm font-medium text-muted-foreground">Helpline</p>
              <p className="text-lg font-bold text-primary">1800-111-555</p>
            </div>
            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="text-sm font-medium text-muted-foreground">FAQ</p>
              <p className="text-lg font-bold text-primary">24/7 Online</p>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <ScrollText className="h-4 w-4 text-secondary" />
            <a href="#" className="text-sm text-secondary font-medium hover:underline">Register Grievance</a>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default ServicesPreview;
