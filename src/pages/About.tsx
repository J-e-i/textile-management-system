import { Factory, Award, Globe, Users } from "lucide-react";

const About = () => {
  const stats = [
    { label: "Years in Business", value: "25+" },
    { label: "Fabric Varieties", value: "500+" },
    { label: "Business Partners", value: "1,200+" },
    { label: "Countries Served", value: "35+" },
  ];

  const capabilities = [
    {
      icon: Factory,
      title: "State-of-the-Art Manufacturing",
      description: "Our modern facility spans 50,000 sq ft with advanced weaving and finishing equipment capable of producing 100,000+ meters of fabric daily.",
    },
    {
      icon: Award,
      title: "Quality Certifications",
      description: "ISO 9001:2015 certified with OEKO-TEX Standard 100 and GOTS certifications for sustainable and organic textiles.",
    },
    {
      icon: Globe,
      title: "Global Export Capability",
      description: "Established export channels to 35+ countries with compliant documentation and reliable international logistics partners.",
    },
    {
      icon: Users,
      title: "Dedicated B2B Support",
      description: "Experienced team of account managers providing personalized service for bulk orders, sampling, and technical consultations.",
    },
  ];

  const markets = [
    "Garment Manufacturers",
    "Fashion Brands",
    "Uniform Suppliers",
    "Home Textile Producers",
    "Industrial Applications",
    "Export Houses",
  ];

  return (
    <div className="py-12 lg:py-16">
      {/* Hero Section */}
      <section className="container mb-16">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="section-heading mb-6">About TEXORDER</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            For over 25 years, we have been a trusted partner for businesses seeking quality textiles. 
            Our digital B2B platform brings our manufacturing excellence to modern businesses, 
            streamlining the bulk ordering process while maintaining the personalized service 
            that has defined our reputation.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-primary py-12 mb-16">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-foreground mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-primary-foreground/70">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Overview */}
      <section className="container mb-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Our Story</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Founded in 1998, TEXORDER started as a small weaving unit in Mumbai's textile district. 
                Through dedication to quality and customer service, we have grown into one of the region's 
                most respected textile manufacturers.
              </p>
              <p>
                Today, we operate a vertically integrated facility handling everything from yarn procurement 
                to fabric finishing. Our digital platform represents the next evolution in our commitment 
                to serving business customers efficiently.
              </p>
              <p>
                We specialize in producing high-quality woven and knitted fabrics for diverse industries, 
                with particular expertise in uniform fabrics, fashion textiles, and technical materials.
              </p>
            </div>
          </div>
          <div className="bg-muted/50 rounded-xl p-8 border border-border">
            <h3 className="font-semibold text-foreground mb-4">Our Mission</h3>
            <p className="text-muted-foreground mb-6">
              To provide businesses with reliable, quality textile solutions through transparent, 
              efficient digital processes that honor traditional manufacturing values.
            </p>
            <h3 className="font-semibold text-foreground mb-4">Our Vision</h3>
            <p className="text-muted-foreground">
              To be the preferred B2B textile partner for businesses across India and globally, 
              known for quality, reliability, and innovation in customer service.
            </p>
          </div>
        </div>
      </section>

      {/* Manufacturing Capabilities */}
      <section className="bg-muted/30 py-16 mb-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="section-heading">Manufacturing Capabilities</h2>
            <p className="section-subheading mx-auto">
              Modern infrastructure backed by decades of textile expertise
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {capabilities.map((capability, index) => (
              <div
                key={capability.title}
                className="card-enterprise p-6 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <capability.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">{capability.title}</h3>
                    <p className="text-sm text-muted-foreground">{capability.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quality Standards */}
      <section className="container mb-16">
        <div className="text-center mb-12">
          <h2 className="section-heading">Quality Standards</h2>
          <p className="section-subheading mx-auto">
            Rigorous testing and certification for every product
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
              <span className="text-2xl font-bold text-accent">ISO</span>
            </div>
            <h3 className="font-semibold text-foreground mb-2">ISO 9001:2015</h3>
            <p className="text-sm text-muted-foreground">
              Certified quality management system ensuring consistent product quality
            </p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
              <span className="text-lg font-bold text-accent">OEKO</span>
            </div>
            <h3 className="font-semibold text-foreground mb-2">OEKO-TEX Standard 100</h3>
            <p className="text-sm text-muted-foreground">
              Tested for harmful substances ensuring safe textiles for all applications
            </p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
              <span className="text-lg font-bold text-accent">GOTS</span>
            </div>
            <h3 className="font-semibold text-foreground mb-2">GOTS Certified</h3>
            <p className="text-sm text-muted-foreground">
              Global Organic Textile Standard for sustainable organic production
            </p>
          </div>
        </div>
      </section>

      {/* Markets Served */}
      <section className="container">
        <div className="bg-muted/50 rounded-xl p-8 border border-border">
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">Markets We Serve</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {markets.map((market) => (
              <div
                key={market}
                className="bg-background rounded-lg px-4 py-3 text-center border border-border"
              >
                <span className="text-sm font-medium text-foreground">{market}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
