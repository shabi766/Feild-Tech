import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/Hooks/useTranslation';
import {
  MapPin, Mail, Phone, ExternalLink,
  Linkedin, Twitter, Facebook, Instagram,
  Briefcase, Shield, Zap
} from 'lucide-react';

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: t('about'), href: '/about' },
    { label: t('contact'), href: '/contact' },
    { label: t('faq'), href: '/faq' },
    { label: t('privacyPolicy'), href: '/privacy' },
  ];

  const socialLinks = [
    { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
    { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
    { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Feild-Tech
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              {t('aboutUsDescription') || 'The premier platform connecting skilled field service technicians with top companies. Find your next opportunity today.'}
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="p-2.5 rounded-xl bg-gray-800 hover:bg-blue-600 text-gray-400 hover:text-white transition-all duration-300 hover:-translate-y-0.5"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links Column */}
          <div>
            <h3 className="text-white font-semibold text-base mb-5">{t('quickLinks')}</h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.href}
                    className="text-sm text-gray-400 hover:text-blue-400 transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-gray-600 group-hover:bg-blue-400 transition-colors"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Professionals Column */}
          <div>
            <h3 className="text-white font-semibold text-base mb-5">For Professionals</h3>
            <ul className="space-y-3">
              {['Browse Jobs', 'Post Resume', 'Skill Assessment', 'Career Resources'].map((item, i) => (
                <li key={i}>
                  <a
                    href="#"
                    className="text-sm text-gray-400 hover:text-blue-400 transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-gray-600 group-hover:bg-blue-400 transition-colors"></span>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h3 className="text-white font-semibold text-base mb-5">{t('contact')}</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-400">support@feild-tech.com</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-400">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-400">San Francisco, CA</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-gray-500">
            &copy; {currentYear} Feild-Tech. {t('allRightsReserved')}.
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <a href="/privacy" className="hover:text-gray-300 transition-colors">Privacy</a>
            <span className="w-1 h-1 rounded-full bg-gray-700"></span>
            <a href="/terms" className="hover:text-gray-300 transition-colors">Terms</a>
            <span className="w-1 h-1 rounded-full bg-gray-700"></span>
            <a href="/cookies" className="hover:text-gray-300 transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;