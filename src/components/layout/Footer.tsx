import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-foreground/20">
                <span className="text-lg font-bold">TX</span>
              </div>
              <span className="text-xl font-bold">TEXORDER</span>
            </div>
            <p className="text-primary-foreground/80 text-sm leading-relaxed">
              Digitizing bulk textile orders for modern businesses. Your trusted partner for quality fabrics and seamless B2B transactions.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/fabrics" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Our Fabrics
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* For Buyers */}
          <div>
            <h4 className="font-semibold mb-4">For Buyers</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/register" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Register as Buyer
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Buyer Login
                </Link>
              </li>
              <li>
                <span className="text-sm text-primary-foreground/80">
                  Request Bulk Quote
                </span>
              </li>
              <li>
                <span className="text-sm text-primary-foreground/80">
                  Track Orders
                </span>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-0.5 text-primary-foreground/60" />
                <span className="text-sm text-primary-foreground/80">
                  Industrial Area, Sector 12<br />
                  Mumbai, Maharashtra 400001
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-primary-foreground/60" />
                <span className="text-sm text-primary-foreground/80">
                  +91 98765 43210
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-primary-foreground/60" />
                <span className="text-sm text-primary-foreground/80">
                  business@textileb2b.com
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-foreground/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-primary-foreground/60">
            © 2024 TEXORDER. All rights reserved.
          </p>
          <div className="flex gap-6">
            <span className="text-sm text-primary-foreground/60 hover:text-primary-foreground cursor-pointer transition-colors">
              Privacy Policy
            </span>
            <span className="text-sm text-primary-foreground/60 hover:text-primary-foreground cursor-pointer transition-colors">
              Terms of Service
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
