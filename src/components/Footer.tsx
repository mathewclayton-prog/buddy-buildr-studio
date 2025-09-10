import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-100 py-12 mt-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {/* Company Column */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/about" 
                  className="text-slate-300 hover:text-white transition-colors duration-200 hover:underline"
                >
                  About
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="text-slate-300 hover:text-white transition-colors duration-200 hover:underline"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link 
                  to="/blog" 
                  className="text-slate-300 hover:text-white transition-colors duration-200 hover:underline"
                >
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/terms" 
                  className="text-slate-300 hover:text-white transition-colors duration-200 hover:underline"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link 
                  to="/privacy" 
                  className="text-slate-300 hover:text-white transition-colors duration-200 hover:underline"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link 
                  to="/community-guidelines" 
                  className="text-slate-300 hover:text-white transition-colors duration-200 hover:underline"
                >
                  Community Guidelines
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Support</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/help" 
                  className="text-slate-300 hover:text-white transition-colors duration-200 hover:underline"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link 
                  to="/faq" 
                  className="text-slate-300 hover:text-white transition-colors duration-200 hover:underline"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="text-slate-300 hover:text-white transition-colors duration-200 hover:underline"
                >
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-slate-700 mt-8 pt-8 text-center">
          <p className="text-slate-400 text-sm">
            © 2024 Buddy Builder Studio. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;