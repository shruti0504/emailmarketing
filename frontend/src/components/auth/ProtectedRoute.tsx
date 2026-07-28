"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";

// Standalone axios instance for the silent refresh check.
// Must NOT go through the main `api` interceptor to avoid circular logic.
const silentRefreshApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // sends the refreshToken httpOnly cookie
});

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      // Access token is present — allow through immediately.
      setLoading(false);
      return;
    }

    // Access token is absent — attempt a silent refresh BEFORE redirecting.
    // The refreshToken httpOnly cookie may still be valid.
    silentRefreshApi
      .post("/auth/refresh")
      .then((res) => {
        const newToken: string = res.data.accessToken;
        localStorage.setItem("accessToken", newToken);
        // Token successfully refreshed — stay on the page.
        setLoading(false);
      })
      .catch(() => {
        // Refresh also failed (cookie missing/expired/revoked).
        // Now it is safe to redirect to login.
        router.push("/signin");
      });
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  return children;
}