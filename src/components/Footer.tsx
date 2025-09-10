import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-nav-orange text-nav-orange-foreground py-4 mt-24 border-t">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto items-center">
          {/* Company Column */}
          <div>
            <h3 className="text-sm font-semibold mb-2 text-nav-orange-foreground">Company</h3>
            <ul className="space-y-1">
              <li>
                <Link 
                  to="/about" 
                  className="text-nav-orange-foreground/80 hover:text-nav-orange-foreground transition-colors duration-200 hover:underline text-xs"
                >
                  About
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="text-nav-orange-foreground/80 hover:text-nav-orange-foreground transition-colors duration-200 hover:underline text-xs"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link 
                  to="/blog" 
                  className="text-nav-orange-foreground/80 hover:text-nav-orange-foreground transition-colors duration-200 hover:underline text-xs"
                >
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h3 className="text-sm font-semibold mb-2 text-nav-orange-foreground">Legal</h3>
            <ul className="space-y-1">
              <li>
                <Link 
                  to="/terms" 
                  className="text-nav-orange-foreground/80 hover:text-nav-orange-foreground transition-colors duration-200 hover:underline text-xs"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link 
                  to="/privacy" 
                  className="text-nav-orange-foreground/80 hover:text-nav-orange-foreground transition-colors duration-200 hover:underline text-xs"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link 
                  to="/community-guidelines" 
                  className="text-nav-orange-foreground/80 hover:text-nav-orange-foreground transition-colors duration-200 hover:underline text-xs"
                >
                  Community Guidelines
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h3 className="text-sm font-semibold mb-2 text-nav-orange-foreground">Support</h3>
            <ul className="space-y-1">
              <li>
                <Link 
                  to="/help" 
                  className="text-nav-orange-foreground/80 hover:text-nav-orange-foreground transition-colors duration-200 hover:underline text-xs"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link 
                  to="/faq" 
                  className="text-nav-orange-foreground/80 hover:text-nav-orange-foreground transition-colors duration-200 hover:underline text-xs"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="text-nav-orange-foreground/80 hover:text-nav-orange-foreground transition-colors duration-200 hover:underline text-xs"
                >
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Copyright */}
          <div className="text-center md:text-right">
            <p className="text-nav-orange-foreground/60 text-xs">
              © 2024 Buddy Builder Studio. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;