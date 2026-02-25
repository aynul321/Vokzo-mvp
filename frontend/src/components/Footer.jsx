import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#0F172A] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#F97316] rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">V</span>
              </div>
              <span className="font-bold text-xl" style={{ fontFamily: 'Poppins' }}>VOKZO</span>
            </div>
            <p className="text-slate-400 text-sm">
              One Platform. Complete Trust. Every Service. Your trusted partner for local services across India.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-slate-400 hover:text-white transition-colors" data-testid="social-facebook">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors" data-testid="social-twitter">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors" data-testid="social-instagram">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors" data-testid="social-linkedin">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-lg mb-4" style={{ fontFamily: 'Poppins' }}>Services</h3>
            <ul className="space-y-2">
              <li><Link to="/category/home-services" className="text-slate-400 hover:text-white text-sm">Home Services</Link></li>
              <li><Link to="/category/appliance-services" className="text-slate-400 hover:text-white text-sm">Appliance Repair</Link></li>
              <li><Link to="/category/tech-services" className="text-slate-400 hover:text-white text-sm">Tech Services</Link></li>
              <li><Link to="/category/vehicle-services" className="text-slate-400 hover:text-white text-sm">Vehicle Services</Link></li>
              <li><Link to="/category/personal-services" className="text-slate-400 hover:text-white text-sm">Personal Services</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-lg mb-4" style={{ fontFamily: 'Poppins' }}>Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-slate-400 hover:text-white text-sm">About Us</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white text-sm">Careers</a></li>
              <li><Link to="/provider-signup" className="text-slate-400 hover:text-white text-sm">Become a Provider</Link></li>
              <li><a href="#" className="text-slate-400 hover:text-white text-sm">Privacy Policy</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white text-sm">Terms of Service</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-lg mb-4" style={{ fontFamily: 'Poppins' }}>Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-slate-400 text-sm">
                <Mail className="w-4 h-4" />
                <a href="mailto:memonaynul2403@gmail.com" className="hover:text-white transition-colors">memonaynul2403@gmail.com</a>
              </li>
              <li className="flex items-center gap-2 text-slate-400 text-sm">
                <Phone className="w-4 h-4" />
                <a href="tel:+918460768898" className="hover:text-white transition-colors">+91 8460768898</a>
              </li>
              <li className="flex items-start gap-2 text-slate-400 text-sm">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span>Ahmedabad, Gujarat, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">
              © 2025 VOKZO. All rights reserved.
            </p>
            <p className="text-slate-500 text-sm">
              Made with trust for India
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
