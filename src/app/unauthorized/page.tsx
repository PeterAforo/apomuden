"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldX, Home, LogIn } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldX className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600">
            You don&apos;t have permission to access this page. Please contact an administrator if you believe this is an error.
          </p>
        </div>

        <div className="space-y-3">
          <Link href="/" className="block">
            <Button variant="default" className="w-full bg-emerald-600 hover:bg-emerald-700">
              <Home className="w-4 h-4 mr-2" />
              Go to Home
            </Button>
          </Link>
          <Link href="/auth/login" className="block">
            <Button variant="outline" className="w-full">
              <LogIn className="w-4 h-4 mr-2" />
              Login with Different Account
            </Button>
          </Link>
        </div>

        <p className="mt-8 text-sm text-gray-500">
          Need admin access?{" "}
          <a href="mailto:support@apomuden.gov.gh" className="text-emerald-600 hover:underline">
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
}
