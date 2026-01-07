'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Camera, Users, UserPlus, LogOut, LogIn } from "lucide-react";
import { useEffect, useState } from "react";
import { getCurrentUser, signOut } from "@/lib/supabase";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  };

  const handleLogout = async () => {
    await signOut();
    setUser(null);
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Auth Header */}
        <div className="flex justify-end mb-8">
          {loading ? (
            <div className="text-gray-600">Loading...</div>
          ) : user ? (
            <div className="flex items-center gap-4">
              <span className="text-gray-700">
                {user.email}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-white hover:bg-gray-100 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors border border-gray-300"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          ) : (
            <div className="flex gap-4">
              <Link href="/login">
                <button className="flex items-center gap-2 bg-white hover:bg-gray-100 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors border border-gray-300">
                  <LogIn className="w-4 h-4" />
                  Login
                </button>
              </Link>
              <Link href="/signup">
                <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                  <UserPlus className="w-4 h-4" />
                  Sign Up
                </button>
              </Link>
            </div>
          )}
        </div>

        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            LinkedIn Face Recognition CRM
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Never forget a face at networking events. Instantly recognize contacts
            and access their LinkedIn profiles.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Enroll Contact */}
          <Link href="/enroll">
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <UserPlus className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-semibold mb-2 text-gray-900">
                Enroll Contact
              </h2>
              <p className="text-gray-600">
                Add new contacts with their face photo and LinkedIn profile
                information.
              </p>
            </div>
          </Link>

          {/* Recognize */}
          <Link href="/recognize">
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <Camera className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold mb-2 text-gray-900">
                Recognize Faces
              </h2>
              <p className="text-gray-600">
                Use your camera to recognize contacts in real-time at networking
                events.
              </p>
            </div>
          </Link>

          {/* Manage Contacts */}
          <Link href="/contacts">
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h2 className="text-2xl font-semibold mb-2 text-gray-900">
                Manage Contacts
              </h2>
              <p className="text-gray-600">
                Browse, search, and manage your professional contact database.
              </p>
            </div>
          </Link>
        </div>

        <div className="mt-16 text-center">
          <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">
              How It Works
            </h3>
            <ol className="text-left space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  <strong>Enroll contacts:</strong> Capture face photos and save LinkedIn
                  profile details
                </span>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                  2
                </span>
                <span>
                  <strong>Recognize at events:</strong> Point your camera and instantly see
                  who you're talking to
                </span>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                  3
                </span>
                <span>
                  <strong>Access details:</strong> View LinkedIn profiles, notes, and
                  interaction history
                </span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
