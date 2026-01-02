import React, { useEffect, useState } from "react";
import api from "../services/api";
import Layout from "../components/Layout";

export default function ProfileView() {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userId = storedUser?.id;

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    api.get(`/user/${userId}`)
      .then(res => setUser(res.data))
      .catch(() => alert("Failed to load profile"))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <Layout><p>Loading profile...</p></Layout>;
  if (!user) return <Layout><p>No user data found.</p></Layout>;
  console.log(user);

  return (
    <Layout>
        <div className="relative z-10">

      <div className="flex justify-center mt-10">
        <div className="w-full max-w-xl">

          {/* Header Section */}
          <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-400 p-6 rounded-t-2xl shadow-xl text-white flex items-center gap-4">

            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-4xl font-bold shadow-lg">
              {user.username.charAt(0).toUpperCase()}
            </div>

            <div>
              <h1 className="text-3xl font-bold">{user.username}</h1>
              <p className="text-white/90">Welcome to your profile</p>
            </div>

          </div>

          {/* Glassmorphism Card */}
          <div className="backdrop-blur-xl bg-white/70 p-6 rounded-b-2xl shadow-2xl border border-white/40">

            <h2 className="text-xl font-semibold mb-4 text-gray-700">Account Details</h2>

            <div className="space-y-4">

              {/* Row */}
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-medium text-gray-600">Email</span>
                <span className="text-gray-800">{user.email}</span>
              </div>

              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-medium text-gray-600">Phone</span>
                <span className="text-gray-800">{user.phone}</span>
              </div>

              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-medium text-gray-600">Address</span>
                <span className="text-gray-800">{user.address || "Not Provided"}</span>
              </div>

              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-medium text-gray-600">Role</span>
                <span className="text-gray-800">{user.role}</span>
              </div>

              <div className="flex justify-between items-center pb-2">
                <span className="font-medium text-gray-600">User ID</span>
                <span className="text-gray-800">{user.id}</span>
              </div>

            </div>

            {/* Edit Button */}
            <div className="mt-6 text-center">
              <a
                href="/update-profile"
                className="px-5 py-2 bg-amber-600 text-white font-semibold rounded-lg shadow hover:bg-amber-700 transition"
              >
                Edit Profile
              </a>
            </div>

          </div>

        </div>
      </div>
      </div>
    </Layout>
  );
}

