import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  UserPlus, 
  FileText, 
  Send, 
  TrendingUp,
  Shield,
  Clock,
  CheckCircle,
  ArrowRight
} from "lucide-react";

const Home = () => {
  const steps = [
    {
      icon: UserPlus,
      title: "Register as Business Buyer",
      description: "Create your business account with GST details for verification",
    },
    {
      icon: FileText,
      title: "Submit Bulk Order Request",
      description: "Specify fabric type, quantity, and delivery requirements",
    },
    {
      icon: Send,
      title: "Receive Quotation",
      description: "Get detailed pricing with taxes and delivery charges",
    },
    {
      icon: TrendingUp,
      title: "Track Order Status",
      description: "Monitor your order from confirmation to delivery",
    },
  ];

  const categories = [
    { name: "Cotton Fabrics", description: "Pure and blended cotton varieties", count: 45 },
    { name: "Polyester Fabrics", description: "Durable synthetic textiles", count: 38 },
    { name: "Silk & Satin", description: "Premium luxury fabrics", count: 24 },
    { name: "Linen Fabrics", description: "Natural breathable textiles", count: 19 },
    { name: "Denim", description: "Heavy-duty woven fabrics", count: 32 },
    { name: "Technical Fabrics", description: "Specialized industrial textiles", count: 27 },
  ];

  const benefits = [
    {
      icon: Clock,
      title: "Operational Efficiency",
      description: "Streamlined quotation process reduces order processing time by 60%",
    },
    {
      icon: Shield,
      title: "Secure B2B Transactions",
      description: "Verified buyer accounts and encrypted data protection",
    },
    {
      icon: CheckCircle,
      title: "Complete Transparency",
      description: "Real-time order tracking and detailed pricing breakdowns",
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-primary py-20 lg:py-28">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtNi42MjcgMC0xMiA1LjM3My0xMiAxMnM1LjM3MyAxMiAxMiAxMiAxMi01LjM3MyAxMi0xMi01LjM3My0xMi0xMi0xMnptMCAyMGMtNC40MTggMC04LTMuNTgyLTgtOHMzLjU4Mi04IDgtOCA4IDMuNTgyIDggOC0zLjU4MiA4LTggOHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjAzIi8+PC9nPjwvc3ZnPg==')] opacity-50"></div>
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 animate-fade-in">
              Digitizing Bulk Textile Orders for Modern Businesses
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              Connect with verified textile manufacturers, request bulk quotations, and manage your orders seamlessly through our enterprise B2B platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <Button size="lg" variant="secondary" asChild className="text-base">
                <Link to="/register">
                  Register as Buyer
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-base border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                <Link to="/fabrics">View Fabrics</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="section-heading">How It Works</h2>
            <p className="section-subheading mx-auto">
              Our streamlined B2B process ensures efficient order management from inquiry to delivery
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="relative card-enterprise p-6 text-center animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                  {index + 1}
                </div>
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center">
                  <step.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16 lg:py-24 bg-muted/50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="section-heading">Featured Fabric Categories</h2>
            <p className="section-subheading mx-auto">
              Explore our extensive range of quality fabrics for your business needs
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <Link
                key={category.name}
                to="/fabrics"
                className="card-enterprise p-6 hover:border-primary/30 transition-all duration-300 animate-fade-in group"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                    {category.count} items
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button asChild variant="outline" size="lg">
              <Link to="/fabrics">
                View All Fabrics
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="section-heading">Why Choose TEXORDER</h2>
            <p className="section-subheading mx-auto">
              Built for enterprise textile businesses with security and efficiency in mind
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={benefit.title}
                className="text-center animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-accent/10 flex items-center justify-center">
                  <benefit.icon className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-20 bg-primary">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Streamline Your Textile Orders?
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Join verified textile businesses already using our platform for efficient bulk ordering
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/register">Get Started Today</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
              <Link to="/contact">Contact Sales</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
