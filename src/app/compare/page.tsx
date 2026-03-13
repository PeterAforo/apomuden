"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, X, Star, MapPin, Phone, Check, Minus } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

interface Facility {
  id: string;
  name: string;
  type: string;
  region: string;
  rating: number;
  reviews: number;
  nhis: boolean;
  emergency: boolean;
  ambulance: boolean;
  beds: number;
  services: string[];
}

const SAMPLE_FACILITIES: Facility[] = [
  {
    id: "1",
    name: "Korle Bu Teaching Hospital",
    type: "HOSPITAL",
    region: "Greater Accra",
    rating: 4.5,
    reviews: 234,
    nhis: true,
    emergency: true,
    ambulance: true,
    beds: 2000,
    services: ["Surgery", "Cardiology", "Pediatrics", "Maternity", "Oncology", "Neurology"],
  },
  {
    id: "2",
    name: "37 Military Hospital",
    type: "HOSPITAL",
    region: "Greater Accra",
    rating: 4.3,
    reviews: 189,
    nhis: true,
    emergency: true,
    ambulance: true,
    beds: 600,
    services: ["Surgery", "Cardiology", "Orthopedics", "Maternity", "Dental"],
  },
  {
    id: "3",
    name: "Ridge Hospital",
    type: "HOSPITAL",
    region: "Greater Accra",
    rating: 4.2,
    reviews: 156,
    nhis: true,
    emergency: true,
    ambulance: false,
    beds: 420,
    services: ["Surgery", "Pediatrics", "Maternity", "General Medicine"],
  },
];

export default function ComparePage() {
  const [selectedFacilities, setSelectedFacilities] = useState<Facility[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const addFacility = (facility: Facility) => {
    if (selectedFacilities.length < 3 && !selectedFacilities.find(f => f.id === facility.id)) {
      setSelectedFacilities([...selectedFacilities, facility]);
      setShowSearch(false);
      setSearchQuery("");
    }
  };

  const removeFacility = (id: string) => {
    setSelectedFacilities(selectedFacilities.filter(f => f.id !== id));
  };

  const filteredFacilities = SAMPLE_FACILITIES.filter(
    f => f.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !selectedFacilities.find(sf => sf.id === f.id)
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Compare Facilities</h1>
            <p className="text-lg text-white/90 max-w-2xl">
              Compare healthcare facilities side by side to make informed decisions about your care.
            </p>
          </motion.div>
        </div>
      </section>

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          {/* Selection Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                {selectedFacilities[index] ? (
                  <Card className="h-full">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900">{selectedFacilities[index].name}</h3>
                          <p className="text-sm text-gray-500">{selectedFacilities[index].type}</p>
                        </div>
                        <button
                          onClick={() => removeFacility(selectedFacilities[index].id)}
                          className="p-1 hover:bg-gray-100 rounded-full"
                        >
                          <X className="h-4 w-4 text-gray-400" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        {selectedFacilities[index].region}
                      </div>
                      <div className="flex items-center gap-1 mt-2">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-medium">{selectedFacilities[index].rating}</span>
                        <span className="text-sm text-gray-400">({selectedFacilities[index].reviews})</span>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="h-full border-dashed border-2 bg-gray-50/50">
                    <CardContent className="p-6 flex flex-col items-center justify-center min-h-[150px]">
                      <button
                        onClick={() => setShowSearch(true)}
                        className="flex flex-col items-center gap-2 text-gray-400 hover:text-emerald-600 transition-colors"
                      >
                        <div className="w-12 h-12 rounded-full border-2 border-dashed border-current flex items-center justify-center">
                          <Plus className="h-6 w-6" />
                        </div>
                        <span className="text-sm font-medium">Add Facility</span>
                      </button>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            ))}
          </div>

          {/* Search Modal */}
          {showSearch && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-xl max-w-md w-full p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Add Facility</h3>
                  <button onClick={() => setShowSearch(false)} className="p-1 hover:bg-gray-100 rounded-full">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search facilities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {filteredFacilities.map((facility) => (
                    <button
                      key={facility.id}
                      onClick={() => addFacility(facility)}
                      className="w-full p-3 text-left rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <p className="font-medium text-gray-900">{facility.name}</p>
                      <p className="text-sm text-gray-500">{facility.region}</p>
                    </button>
                  ))}
                  {filteredFacilities.length === 0 && (
                    <p className="text-center text-gray-500 py-4">No facilities found</p>
                  )}
                </div>
              </motion.div>
            </div>
          )}

          {/* Comparison Table */}
          {selectedFacilities.length >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card>
                <CardContent className="p-0 overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Feature</th>
                        {selectedFacilities.map((f) => (
                          <th key={f.id} className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                            {f.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr>
                        <td className="px-6 py-4 text-sm text-gray-500">Rating</td>
                        {selectedFacilities.map((f) => (
                          <td key={f.id} className="px-6 py-4">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                              <span className="font-medium">{f.rating}</span>
                              <span className="text-gray-400 text-sm">({f.reviews})</span>
                            </div>
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-sm text-gray-500">NHIS Accepted</td>
                        {selectedFacilities.map((f) => (
                          <td key={f.id} className="px-6 py-4">
                            {f.nhis ? (
                              <Check className="h-5 w-5 text-green-500" />
                            ) : (
                              <Minus className="h-5 w-5 text-gray-300" />
                            )}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-sm text-gray-500">Emergency Services</td>
                        {selectedFacilities.map((f) => (
                          <td key={f.id} className="px-6 py-4">
                            {f.emergency ? (
                              <Check className="h-5 w-5 text-green-500" />
                            ) : (
                              <Minus className="h-5 w-5 text-gray-300" />
                            )}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-sm text-gray-500">Ambulance</td>
                        {selectedFacilities.map((f) => (
                          <td key={f.id} className="px-6 py-4">
                            {f.ambulance ? (
                              <Check className="h-5 w-5 text-green-500" />
                            ) : (
                              <Minus className="h-5 w-5 text-gray-300" />
                            )}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-sm text-gray-500">Bed Capacity</td>
                        {selectedFacilities.map((f) => (
                          <td key={f.id} className="px-6 py-4 font-medium">{f.beds}</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-sm text-gray-500">Services</td>
                        {selectedFacilities.map((f) => (
                          <td key={f.id} className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {f.services.slice(0, 4).map((s) => (
                                <span key={s} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                  {s}
                                </span>
                              ))}
                              {f.services.length > 4 && (
                                <span className="text-xs text-gray-400">+{f.services.length - 4} more</span>
                              )}
                            </div>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {selectedFacilities.length < 2 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Select at least 2 facilities to compare</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
