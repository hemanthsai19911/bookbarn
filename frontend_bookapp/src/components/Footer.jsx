import React, { useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";
import { BookOpen, Facebook, Twitter, Instagram, Linkedin, Send, Mail, MapPin, Phone } from "lucide-react";
import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 pt-16 pb-8 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* Brand Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-white text-2xl font-serif font-bold">
              <div className="bg-amber-500 p-2 rounded-lg text-gray-900 shadow-lg shadow-amber-500/20">
                <BookOpen size={24} strokeWidth={2.5} />
              </div>
              BookBarn
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your premier destination for literary adventures. We curate the finest collection of books to inspire, educate, and entertain readers of all ages.
            </p>
            <div className="flex gap-4">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-amber-600 hover:text-white transition-all transform hover:-translate-y-1">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Quick Links</h3>
            <ul className="space-y-4 text-sm">
              <li><Link to="/" className="hover:text-amber-500 transition-colors flex items-center gap-2">Home</Link></li>
              <li><Link to="/books" className="hover:text-amber-500 transition-colors flex items-center gap-2">Browse Books</Link></li>
              <li><Link to="/about" className="hover:text-amber-500 transition-colors flex items-center gap-2">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-amber-500 transition-colors flex items-center gap-2">Contact Support</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Contact Us</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-amber-500 mt-0.5 shrink-0" />
                <span>123 Literary Avenue, Booktown,<br /> NY 10012, United States</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-amber-500 shrink-0" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-amber-500 shrink-0" />
                <span>support@bookbarn.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Stay Updated</h3>
            <p className="text-gray-400 text-sm mb-4">Subscribe to get the latest book updates and exclusive offers.</p>
            <NewsletterForm />
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} BookBarn. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
          </div>
        </div>

      </div>
    </footer>
  );
}

function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle, loading, success, error
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    try {
      await api.post("/newsletter/subscribe", { email });
      setStatus("success");
      setMsg("Subscribed successfully!");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setMsg(err.response?.data || "Subscription failed");
    }
  };

  return (
    <div className="space-y-2">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          disabled={status === "loading" || status === "success"}
          className="w-full bg-gray-800 border border-gray-700 text-white pl-4 pr-12 py-3 rounded-xl focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all placeholder:text-gray-500 disabled:opacity-50"
        />
        <button
          disabled={status === "loading" || status === "success"}
          className="absolute right-2 top-2 p-1.5 bg-amber-500 text-gray-900 rounded-lg hover:bg-amber-400 transition-colors disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </form>
      {status === "success" && <p className="text-green-400 text-xs font-bold">{msg}</p>}
      {status === "error" && <p className="text-red-400 text-xs font-bold">{msg}</p>}
    </div>
  );
}
