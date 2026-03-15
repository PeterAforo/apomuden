"use client";

import { useState } from "react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

export default function PushNotifications() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const subscribe = async () => {
    try {
      setLoading(true);
      setMessage("");

      if (!("serviceWorker" in navigator)) {
        setMessage("Service workers are not supported in this browser.");
        return;
      }

      if (!("PushManager" in window)) {
        setMessage("Push notifications are not supported in this browser.");
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setMessage("Notification permission was denied.");
        return;
      }

      const registration = await navigator.serviceWorker.register("/sw.js");

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string
        ),
      });

      const res = await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subscription),
      });

      const data = await res.json();
      setMessage(data.message || "Subscribed successfully.");
    } catch (error) {
      console.error(error);
      setMessage("Subscription failed.");
    } finally {
      setLoading(false);
    }
  };

  const sendTestNotification = async () => {
    try {
      setLoading(true);
      setMessage("");

      const res = await fetch("/api/notifications/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "Apomuden Update",
          message: "Your push notification setup is working.",
          url: "/",
        }),
      });

      const data = await res.json();
      setMessage(data.message || `Delivered: ${data.delivered ?? 0}, Failed: ${data.failed ?? 0}`);
    } catch (error) {
      console.error(error);
      setMessage("Failed to send test notification.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Push Notifications Test</h2>

        <div className="space-y-4">
          <button 
            onClick={subscribe} 
            disabled={loading}
            className="w-full py-3 px-4 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Processing..." : "Subscribe to Notifications"}
          </button>

          <button 
            onClick={sendTestNotification} 
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Sending..." : "Send Test Notification"}
          </button>
        </div>

        {message && (
          <div className={`mt-6 p-4 rounded-lg ${message.includes("failed") || message.includes("denied") ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>
            {message}
          </div>
        )}

        <p className="mt-6 text-sm text-gray-500">
          Make sure you have set <code className="bg-gray-100 px-1 rounded">NEXT_PUBLIC_VAPID_PUBLIC_KEY</code> in your environment variables.
        </p>
      </div>
    </div>
  );
}
