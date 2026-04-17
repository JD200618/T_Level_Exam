import { Leaf, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router';

export function Footer() {
  return (
    <footer className="mt-auto border-t" style={{ backgroundColor: '#FAFAF5', borderColor: 'rgba(0,0,0,0.1)' }}>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2E7D32]">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg" style={{ color: '#2E7D32' }}>
                Greenfield Local Hub
              </h3>
            </div>
            <p className="text-sm mb-4" style={{ color: '#6B6B6B' }}>
              Your trusted source for fresh, locally-sourced produce. 
              Supporting local farmers and bringing farm-fresh quality to your table.
            </p>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="mb-4" style={{ color: '#2E2E2E' }}>Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Phone className="h-4 w-4 mt-1" style={{ color: '#2E7D32' }} />
                <span className="text-sm" style={{ color: '#6B6B6B' }}>
                  (555) 123-4567
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="h-4 w-4 mt-1" style={{ color: '#2E7D32' }} />
                <span className="text-sm" style={{ color: '#6B6B6B' }}>
                  hello@greenfieldlocal.com
                </span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-1" style={{ color: '#2E7D32' }} />
                <span className="text-sm" style={{ color: '#6B6B6B' }}>
                  123 Farm Road, Greenfield
                </span>
              </div>
            </div>
          </div>

          {/* Hours */}
          <div>
            <h4 className="mb-4" style={{ color: '#2E2E2E' }}>Store Hours</h4>
            <div className="space-y-2 text-sm" style={{ color: '#6B6B6B' }}>
              <p>Monday - Friday: 8am - 7pm</p>
              <p>Saturday: 9am - 6pm</p>
              <p>Sunday: 10am - 5pm</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
          <p className="text-sm" style={{ color: '#6B6B6B' }}>
            © 2026 Greenfield Local Hub. All rights reserved.
          </p>
          <Link to="/admin-login" className="text-xs mt-2 inline-block hover:underline" style={{ color: '#6B6B6B' }}>
            Admin Access
          </Link>
        </div>
      </div>
    </footer>
  );
}