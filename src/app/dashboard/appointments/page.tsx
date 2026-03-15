"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { 
  Calendar, Clock, MapPin, Building2, Plus, 
  ChevronRight, AlertCircle 
} from "lucide-react";

export default function AppointmentsPage() {
  const [appointments] = useState<any[]>([]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
            <p className="text-gray-600 mt-1">Manage your healthcare appointments</p>
          </div>
          <Link href="/facilities">
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" />
              Book Appointment
            </Button>
          </Link>
        </div>

        {appointments.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="py-16 text-center">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-10 h-10 text-emerald-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                No appointments yet
              </h2>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                You haven&apos;t booked any appointments. Find a healthcare facility 
                and schedule your first appointment.
              </p>
              <Link href="/facilities">
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <Building2 className="w-4 h-4 mr-2" />
                  Browse Facilities
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <Card key={appointment.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{appointment.facilityName}</h3>
                        <p className="text-sm text-gray-600">{appointment.service}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {appointment.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {appointment.location}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Coming Soon Notice */}
        <Card className="mt-8 border-amber-200 bg-amber-50">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <div>
                <p className="font-medium text-amber-800">Online Booking Coming Soon</p>
                <p className="text-sm text-amber-700">
                  We&apos;re working on enabling online appointment booking. For now, please contact facilities directly.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
