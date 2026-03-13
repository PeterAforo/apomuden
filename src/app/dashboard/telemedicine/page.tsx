"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Video, 
  Calendar, 
  Clock, 
  User, 
  Phone,
  Loader2,
  CheckCircle,
  AlertCircle,
  Search,
  Star
} from "lucide-react";

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  facility: string;
  rating: number;
  consultationFee: number;
  availableSlots: string[];
  imageUrl?: string;
}

interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
  meetingLink?: string;
}

export default function TelemedicinePage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [doctorsRes, appointmentsRes] = await Promise.all([
        fetch("/api/telemedicine/doctors"),
        fetch("/api/telemedicine/appointments"),
      ]);

      if (doctorsRes.ok) {
        const data = await doctorsRes.json();
        setDoctors(data.doctors);
      }

      if (appointmentsRes.ok) {
        const data = await appointmentsRes.json();
        setAppointments(data.appointments);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedDoctor || !selectedSlot) return;

    setIsBooking(true);
    try {
      const response = await fetch("/api/telemedicine/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: selectedDoctor.id,
          slot: selectedSlot,
        }),
      });

      if (response.ok) {
        setBookingSuccess(true);
        fetchData();
        setTimeout(() => {
          setShowBookingModal(false);
          setBookingSuccess(false);
          setSelectedDoctor(null);
          setSelectedSlot("");
        }, 2000);
      }
    } catch (error) {
      console.error("Error booking appointment:", error);
    } finally {
      setIsBooking(false);
    }
  };

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = !selectedSpecialty || doctor.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  const specialties = Array.from(new Set(doctors.map(d => d.specialty)));

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3">
            <Video className="h-8 w-8" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Telemedicine</h1>
              <p className="text-blue-100 mt-1">Consult with doctors from the comfort of your home</p>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        {/* Upcoming Appointments */}
        {appointments.length > 0 && (
          <Card className="mb-8 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Your Upcoming Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointments.filter(a => a.status === "SCHEDULED").map((apt) => (
                  <div key={apt.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold">{apt.doctorName}</h4>
                      <p className="text-sm text-gray-600">{apt.specialty}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(apt.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {apt.time}
                        </span>
                      </div>
                    </div>
                    {apt.meetingLink && (
                      <a href={apt.meetingLink} target="_blank" rel="noopener noreferrer">
                        <Button className="bg-blue-600 hover:bg-blue-700">
                          <Video className="h-4 w-4 mr-2" />
                          Join Call
                        </Button>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search doctors by name or specialty..."
                  className="pl-10"
                />
              </div>
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="px-4 py-2 border rounded-md"
              >
                <option value="">All Specialties</option>
                {specialties.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Doctors List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : filteredDoctors.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <User className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h2 className="text-xl font-semibold text-gray-700 mb-2">No doctors available</h2>
              <p className="text-gray-500">Try adjusting your search criteria</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor) => (
              <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{doctor.name}</h3>
                      <p className="text-blue-600">{doctor.specialty}</p>
                      <p className="text-sm text-gray-500">{doctor.facility}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm">{doctor.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-gray-600">Consultation Fee</span>
                      <span className="font-semibold text-lg">GH₵ {doctor.consultationFee}</span>
                    </div>
                    <div className="text-sm text-gray-500 mb-3">
                      {doctor.availableSlots.length} slots available today
                    </div>
                    <Button
                      onClick={() => {
                        setSelectedDoctor(doctor);
                        setShowBookingModal(true);
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Book Appointment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Booking Modal */}
        {showBookingModal && selectedDoctor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowBookingModal(false)} />
            <Card className="relative w-full max-w-md">
              <CardHeader>
                <CardTitle>Book Appointment</CardTitle>
              </CardHeader>
              <CardContent>
                {bookingSuccess ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-green-700">Appointment Booked!</h3>
                    <p className="text-gray-600 mt-2">You will receive a confirmation shortly.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{selectedDoctor.name}</h4>
                        <p className="text-sm text-blue-600">{selectedDoctor.specialty}</p>
                      </div>
                    </div>

                    <div>
                      <Label>Select Time Slot</Label>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {selectedDoctor.availableSlots.map((slot) => (
                          <button
                            key={slot}
                            onClick={() => setSelectedSlot(slot)}
                            className={`p-2 text-sm rounded-md border transition-colors ${
                              selectedSlot === slot
                                ? "bg-blue-600 text-white border-blue-600"
                                : "hover:border-blue-300"
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex justify-between">
                        <span>Consultation Fee</span>
                        <span className="font-semibold">GH₵ {selectedDoctor.consultationFee}</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setShowBookingModal(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleBookAppointment}
                        disabled={!selectedSlot || isBooking}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        {isBooking ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Confirm Booking"
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
