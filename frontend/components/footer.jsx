import Link from 'next/link'
import { Mail, Phone, MapPin } from 'lucide-react'

// lucide-react no longer ships brand/social icons (Facebook, Instagram,
// etc. were removed upstream), so these are small hand-drawn SVGs kept
// in the same stroke style (24x24, currentColor, rounded strokes) as
// every other icon in the app, sized/used exactly like a lucide icon.
function FacebookIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

function InstagramIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

export function Footer() {
  return (
    <footer className="bg-muted border-t border-border">
      <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-accent">Rustic Oven</h3>
            <p className="text-foreground/60 text-sm">
              Premium wood-fired pizzas, artisan burgers, and handcrafted food. Order online with imported ingredients and fast delivery.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/menu" className="text-foreground/60 hover:text-accent transition-colors">
                  Menu
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-foreground/60 hover:text-accent transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-foreground/60 hover:text-accent transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-foreground/60 hover:text-accent transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className="font-semibold mb-4">Policies</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-foreground/60 hover:text-accent transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-foreground/60 hover:text-accent transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/refund" className="text-foreground/60 hover:text-accent transition-colors">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-foreground/60 hover:text-accent transition-colors">
                  Shipping Info
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-2">
                <Phone size={16} className="text-accent flex-shrink-0 mt-0.5" />
                <a href="tel:+919876543210" className="text-foreground/60 hover:text-accent transition-colors">
                  +91 98765 43210
                </a>
              </li>
              <li className="flex gap-2">
                <Mail size={16} className="text-accent flex-shrink-0 mt-0.5" />
                <a href="mailto:hello@brewcafe.com" className="text-foreground/60 hover:text-accent transition-colors">
                  hello@brewcafe.com
                </a>
              </li>
              <li className="flex gap-2">
                <MapPin size={16} className="text-accent flex-shrink-0 mt-0.5" />
                <span className="text-foreground/60">
                  Mumbai, India
                </span>
              </li>
            </ul>

            {/* Social icons */}
            <div className="flex gap-3 mt-4">
              <a
                href="#"
                aria-label="Facebook"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-accent/10 text-accent hover:bg-accent hover:text-white transition-colors"
              >
                <FacebookIcon size={16} />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-accent/10 text-accent hover:bg-accent hover:text-white transition-colors"
              >
                <InstagramIcon size={16} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-foreground/50 text-sm">
            &copy; 2024 BrewCafe. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-foreground/50 hover:text-accent transition-colors text-sm">
              Twitter
            </a>
            <a href="#" className="text-foreground/50 hover:text-accent transition-colors text-sm">
              Instagram
            </a>
            <a href="#" className="text-foreground/50 hover:text-accent transition-colors text-sm">
              Facebook
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
