import React, { useEffect, useState } from "react";
import api from "../services/api";
import { User, Mail, Phone, MapPin, Shield, Edit } from "lucide-react";

export default function VendorProfile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProfile();
    }, []);

    async function loadProfile() {
        try {
            const res = await api.get("/vendor/profile");
            setProfile(res.data);
        } catch (err) {
            console.error("Failed to load profile", err);
        } finally {
            setLoading(false);
        }
    }

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-600 border-t-transparent"></div>
        </div>
    );

    if (!profile) return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] text-gray-500">
            Failed to load profile.
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8F9FA] py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-8 py-10 text-white">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-bold font-serif mb-2">{profile.name}</h1>
                                <div className="flex items-center gap-2 text-gray-300 text-sm font-medium uppercase tracking-wider">
                                    <Shield size={16} className="text-emerald-400" />
                                    <span>{profile.status} Vendor</span>
                                </div>
                            </div>
                            <div className="h-16 w-16 bg-white/10 rounded-full flex items-center justify-center text-2xl font-bold backdrop-blur">
                                {profile.name.charAt(0).toUpperCase()}
                            </div>
                        </div>
                    </div>

                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                                        <Mail size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wide">Email Address</p>
                                        <p className="text-gray-900 font-medium">{profile.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                                        <Phone size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wide">Phone Number</p>
                                        <p className="text-gray-900 font-medium">{profile.phone || "Not provided"}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                                        <MapPin size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wide">Business Address</p>
                                        <p className="text-gray-900 font-medium leading-relaxed">{profile.address || "Not provided"}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wide">Account ID</p>
                                        <p className="text-gray-900 font-medium">#{profile.id}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 pt-8 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={() => window.location.href = "/vendor/update-profile"}
                                className="btn-primary flex items-center gap-2 px-6 py-3"
                            >
                                <Edit size={18} /> Edit Profile
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

