"use client";

import { useState } from "react";
import { Bell, BellOff, Send, Loader2, CheckCircle, XCircle } from "lucide-react";

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
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isError, setIsError] = useState(false);

  const subscribe = async () => {
    try {
      setLoading(true);
      setMessage("");
      setIsError(false);

      if (!("serviceWorker" in navigator)) {
        setMessage("Service workers are not supported in this browser.");
        setIsError(true);
        return;
      }

      if (!("PushManager" in window)) {
        setMessage("Push notifications are not supported in this browser.");
        setIsError(true);
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setMessage("Notification permission was denied.");
        setIsError(true);
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
      setMessage(data.message || "Subscribed successfully!");
      setIsSubscribed(true);
    } catch (error) {
      console.error(error);
      setMessage("Subscription failed. Please try again.");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  const sendTestNotification = async () => {
    try {
      setLoading(true);
      setMessage("");
      setIsError(false);

      const res = await fetch("/api/notifications/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "Apomuden Health Alert",
          message: "Your push notification setup is working correctly!",
          url: "/",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage(`Notification sent! Delivered: ${data.delivered}, Failed: ${data.failed}`);
      } else {
        setMessage(data.message || "Failed to send notification.");
        setIsError(true);
      }
    } catch (error) {
      console.error(error);
      setMessage("Failed to send test notification.");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
          <Bell className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Push Notifications</h3>
          <p className="text-sm text-gray-500">Get health alerts on your device</p>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={subscribe}
          disabled={loading || isSubscribed}
          className={`w-full py-3 px-4 font-medium rounded-xl transition-colors flex items-center justify-center gap-2 ${
            isSubscribed
              ? "bg-emerald-100 text-emerald-700 cursor-default"
              : "bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
          }`}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : isSubscribed ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <Bell className="w-5 h-5" />
          )}
          {isSubscribed ? "Subscribed" : "Enable Notifications"}
        </button>

        {isSubscribed && (
          <button
            onClick={sendTestNotification}
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
            Send Test Notification
          </button>
        )}
      </div>

      {message && (
        <div
          className={`mt-4 p-3 rounded-lg flex items-start gap-2 text-sm ${
            isError
              ? "bg-red-50 text-red-700"
              : "bg-emerald-50 text-emerald-700"
          }`}
        >
          {isError ? (
            <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          ) : (
            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          )}
          {message}
        </div>
      )}
    </div>
  );
}
