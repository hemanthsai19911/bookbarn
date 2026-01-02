import React, { useEffect, useState } from "react";
import api from "../services/api";
import { User, Phone, MapPin, Mail, Shield, PenTool } from "lucide-react";
import { Link } from "react-router-dom";
import DeliveryNavbar from "../components/DeliveryNavbar";

export default function DeliveryProfile() {
  const agent = JSON.parse(localStorage.getItem("deliveryAgent"));
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const res = await api.get(`/delivery/me/${agent.id}`);
      setProfile(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <DeliveryNavbar />
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <DeliveryNavbar />
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <p>Failed to load profile data.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <DeliveryNavbar />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Header Banner */}
          <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
            <div className="absolute -bottom-16 left-8 flex items-end">
              <div className="w-32 h-32 bg-white rounded-full p-2 shadow-lg">
                <div className="w-full h-full bg-blue-50 rounded-full flex items-center justify-center text-4xl font-bold text-blue-600">
                  {profile.name?.charAt(0)}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-20 px-8 pb-8">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
                <div className="flex items-center gap-2 mt-2 text-gray-500">
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wide">
                    {profile.status}
                  </span>
                  <span>•</span>
                  <span>Member since {new Date().getFullYear()}</span>
                </div>
              </div>

              <Link to="/delivery/update-profile" className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium shadow-lg shadow-gray-200">
                <PenTool size={18} />
                Edit Profile
              </Link>
            </div>

            <div className="grid md:grid-cols-2 gap-8">

              {/* Contact Info */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b pb-2">
                  <Shield size={20} className="text-blue-600" />
                  Account Information
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <Mail size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address</p>
                      <p className="font-medium text-gray-900">{profile.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <Phone size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Phone Number</p>
                      <p className="font-medium text-gray-900">{profile.phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Info */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b pb-2">
                  <MapPin size={20} className="text-blue-600" />
                  Service Area
                </h3>

                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
                  <p className="text-blue-900 font-medium mb-1">Primary Zone</p>
                  <p className="text-2xl font-bold text-blue-700">{profile.area}</p>
                  <p className="text-blue-600/80 text-sm mt-2">Active delivery partner</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-xl text-center">
                    <p className="text-2xl font-bold text-gray-900">4.8</p>
                    <p className="text-xs text-gray-500 font-bold uppercase">Rating</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl text-center">
                    <p className="text-2xl font-bold text-gray-900">100%</p>
                    <p className="text-xs text-gray-500 font-bold uppercase">On Time</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

