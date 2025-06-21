import Link from 'next/link'
import { Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-primary-500" />
              <span className="text-xl font-bold">FoodRescue</span>
            </div>
            <p className="text-gray-300 text-sm">
              Connecting food donors with recipients to reduce waste and build stronger communities.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary-500 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-500 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-500 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-500 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <div className="space-y-2">
              <Link href="/about" className="block text-gray-300 hover:text-primary-500 transition-colors text-sm">
                About Us
              </Link>
              <Link href="/how-it-works" className="block text-gray-300 hover:text-primary-500 transition-colors text-sm">
                How It Works
              </Link>
              <Link href="/explore" className="block text-gray-300 hover:text-primary-500 transition-colors text-sm">
                Explore Food
              </Link>
              <Link href="/impact" className="block text-gray-300 hover:text-primary-500 transition-colors text-sm">
                Our Impact
              </Link>
              <Link href="/faq" className="block text-gray-300 hover:text-primary-500 transition-colors text-sm">
                FAQ
              </Link>
            </div>
          </div>

          {/* For Users */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">For Users</h3>
            <div className="space-y-2">
              <Link href="/auth/register" className="block text-gray-300 hover:text-primary-500 transition-colors text-sm">
                Sign Up
              </Link>
              <Link href="/safety" className="block text-gray-300 hover:text-primary-500 transition-colors text-sm">
                Food Safety
              </Link>
              <Link href="/guidelines" className="block text-gray-300 hover:text-primary-500 transition-colors text-sm">
                Guidelines
              </Link>
              <Link href="/support" className="block text-gray-300 hover:text-primary-500 transition-colors text-sm">
                Support
              </Link>
              <Link href="/community" className="block text-gray-300 hover:text-primary-500 transition-colors text-sm">
                Community
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-primary-500" />
                <span className="text-gray-300 text-sm">support@foodrescue.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-primary-500" />
                <span className="text-gray-300 text-sm">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-primary-500" />
                <span className="text-gray-300 text-sm">123 Food Street, City, State 12345</span>
              </div>
            </div>
            <div className="mt-4">
              <h4 className="text-sm font-semibold mb-2">Subscribe to our newsletter</h4>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-3 py-2 bg-gray-800 text-white rounded-l-md border border-gray-700 focus:outline-none focus:border-primary-500"
                />
                <button className="px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-r-md transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 FoodRescue. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-gray-400 hover:text-primary-500 text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-primary-500 text-sm transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-gray-400 hover:text-primary-500 text-sm transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
