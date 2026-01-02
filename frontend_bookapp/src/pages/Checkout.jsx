import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { MapPin, Phone, CreditCard, ArrowRight, ShieldCheck, Navigation, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Checkout() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user"));

  const [address, setAddress] = useState(storedUser?.address || "");
  const [phone, setPhone] = useState(storedUser?.phone || "");
  const [loadingLocation, setLoadingLocation] = useState(false);

  // Get current location and convert to address
  async function getCurrentLocation() {
    if (!navigator.geolocation) {
      // If geolocation not supported, try IP-based location directly
      await getLocationByIP();
      return;
    }

    setLoadingLocation(true);

    // Try with high accuracy first, fallback to lower accuracy if timeout
    const tryGetLocation = (useHighAccuracy, timeout) => {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: useHighAccuracy,
            timeout: timeout,
            maximumAge: 30000 // Accept cached position up to 30 seconds old
          }
        );
      });
    };

    try {
      let position;
      try {
        // First attempt: High accuracy with 15 second timeout
        position = await tryGetLocation(true, 15000);
      } catch (firstError) {
        if (firstError.code === 3) { // TIMEOUT
          // Second attempt: Lower accuracy with 20 second timeout
          console.log("High accuracy timed out, trying lower accuracy...");
          try {
            position = await tryGetLocation(false, 20000);
          } catch (secondError) {
            // If GPS completely fails, try IP-based location
            console.log("GPS failed, trying IP-based location...");
            await getLocationByIP();
            return;
          }
        } else {
          throw firstError;
        }
      }

      const { latitude, longitude } = position.coords;

      try {
        // Using OpenStreetMap's Nominatim API for reverse geocoding
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
        );
        const data = await response.json();

        if (data && data.display_name) {
          // Format the address nicely
          const addr = data.address;
          const formattedAddress = [
            addr.house_number,
            addr.road,
            addr.suburb || addr.neighbourhood,
            addr.city || addr.town || addr.village,
            addr.state,
            addr.postcode,
            addr.country
          ].filter(Boolean).join(", ");

          setAddress(formattedAddress || data.display_name);
          setLoadingLocation(false);
        } else {
          throw new Error("No address data received");
        }
      } catch (error) {
        console.error("Error fetching address:", error);
        // Provide coordinates as fallback
        const fallbackAddress = `Lat: ${latitude.toFixed(6)}, Long: ${longitude.toFixed(6)}`;
        setAddress(fallbackAddress);
        alert("Could not fetch full address. Coordinates have been filled. Please complete the address manually.");
        setLoadingLocation(false);
      }
    } catch (error) {
      let errorMessage = "Unable to retrieve your location";

      switch (error.code) {
        case 1: // PERMISSION_DENIED
          errorMessage = "Location permission denied. Trying alternative method...";
          console.log(errorMessage);
          await getLocationByIP();
          return;
        case 2: // POSITION_UNAVAILABLE
          errorMessage = "GPS unavailable. Trying alternative method...";
          console.log(errorMessage);
          await getLocationByIP();
          return;
        case 3: // TIMEOUT
          // Already handled above
          break;
      }

      setLoadingLocation(false);
    }
  }

  // Fallback: Get approximate location based on IP address
  async function getLocationByIP() {
    try {
      // Using ipapi.co - free IP geolocation API
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();

      if (data && data.city) {
        const ipBasedAddress = [
          data.city,
          data.region,
          data.postal,
          data.country_name
        ].filter(Boolean).join(", ");

        setAddress(ipBasedAddress);
        alert(`📍 Approximate location detected: ${data.city}, ${data.region}\n\nThis is based on your internet connection. Please verify and complete your exact address.`);
      } else {
        throw new Error("Could not determine location");
      }
    } catch (error) {
      console.error("IP-based location failed:", error);
      alert("Unable to detect location automatically. Please enter your address manually.");
    } finally {
      setLoadingLocation(false);
    }
  }

  async function confirmOrder() {
    if (!address.trim() || !phone.trim()) {
      alert("Address and phone number are required");
      return;
    }

    const user = JSON.parse(localStorage.getItem("user"));
    const tempOrder = {
      userId: user.id,
      address,
      phone,
      items: state?.items || [],
      subtotal: state?.subtotal || 0,
      shipping: state?.shipping || 0,
      tax: state?.tax || 0,
      total: state?.total || 0,
      buyNow: state?.buyNow || false
    };

    localStorage.setItem("order_temp", JSON.stringify(tempOrder));
    navigate("/payment", { state }); // Forward state to payment
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          {/* Steps Indicator */}
          <div className="flex items-center justify-center mb-10 gap-4">
            <div className="flex items-center gap-2 text-gray-400 font-medium">
              <span className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center">1</span>
              Summary
            </div>
            <div className="w-12 h-0.5 bg-amber-600"></div>
            <div className="flex items-center gap-2 text-amber-700 font-bold">
              <span className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center shadow-lg shadow-amber-600/30">2</span>
              Shipping
            </div>
            <div className="w-12 h-0.5 bg-gray-300"></div>
            <div className="flex items-center gap-2 text-gray-400 font-medium">
              <span className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center">3</span>
              Payment
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Shipping Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="md:col-span-2 bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
            >
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6 flex items-center gap-2">
                <MapPin className="text-amber-600" /> Shipping Details
              </h2>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-semibold text-gray-700">Delivery Address</label>
                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      disabled={loadingLocation}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingLocation ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          Detecting...
                        </>
                      ) : (
                        <>
                          <Navigation size={14} />
                          Use Current Location
                        </>
                      )}
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter full address (House No, Street, City, Pincode)"
                    className="w-full p-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Number</label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-4 text-gray-400 group-focus-within:text-amber-600 transition-colors" size={20} />
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Phone number for delivery updates"
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Summary Side Panel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
                <div className="space-y-3 pb-4 border-b border-gray-100">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{state?.subtotal || state?.total}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className={state?.shipping === 0 ? "text-green-600 font-medium" : ""}>
                      {state?.shipping !== undefined
                        ? (state.shipping === 0 ? "Free" : `₹${state.shipping}`)
                        : "Free"}
                    </span>
                  </div>
                  {state?.tax > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>Tax (5%)</span>
                      <span>₹{state.tax}</span>
                    </div>
                  )}
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-900 mt-4">
                  <span>Total</span>
                  <span>₹{state?.total}</span>
                </div>
              </div>

              <button
                id="checkout-next-step"
                data-testid="checkout-next-step-btn"
                onClick={confirmOrder}
                className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-amber-700 hover:shadow-xl hover:scale-[1.02] transform transition-all flex items-center justify-center gap-2"
              >
                Next Step <ArrowRight size={20} />
              </button>

              <div className="flex items-center gap-2 justify-center text-xs text-gray-400">
                <ShieldCheck size={14} /> Secure Checkout
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
}


