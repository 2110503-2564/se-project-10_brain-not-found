'use client';
import { Facebook, Instagram, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white text-orange-600 py-8 border-t border-orange-300">
      <div className="container mx-auto px-6 lg:px-20 flex flex-col items-center">
        {/* โลโก้และชื่อแบรนด์ */}
        <h2 className="text-2xl font-bold mb-4">Massage Reservation</h2>

        {/* ข้อมูลติดต่อ */}
        <div className="flex flex-col items-center space-y-3 mb-6">
          <p className="flex items-center">
            <Phone className="w-5 h-5 mr-2" /> 089-123-4567
          </p>
          <p className="flex items-center">
            <Mail className="w-5 h-5 mr-2" /> contact@massage.com
          </p>
          <p className="flex items-center">
            <MapPin className="w-5 h-5 mr-2" /> Bangkok, Thailand
          </p>
        </div>

        {/* Social Media Icons */}
        <div className="flex space-x-5">
          <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" className="hover:text-orange-400">
            <Facebook className="w-6 h-6" />
          </a>
          <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" className="hover:text-orange-400">
            <Instagram className="w-6 h-6" />
          </a>
        </div>

        {/* Copyright */}
        <p className="text-sm text-orange-500 mt-6">© 2025 Massage Reservation. All rights reserved.</p>
      </div>
    </footer>
  );
}
