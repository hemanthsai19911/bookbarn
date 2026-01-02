import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">

      {/* Top Navigation */}
      <Navbar />

      {/* Page Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Bottom Footer */}
      <Footer />
    </div>
  );
}

