"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, Plus, X, Star, MapPin, Check, Minus, 
  Award, Shield, Building2, Home, Stethoscope,
  Activity, Loader2, ChevronDown, ChevronUp,
  Sparkles, DollarSign, Wrench, Building
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

interface Service {
  id: string;
  name: string;
  category: string | null;
  priceGhs: number;
  nhisCovered: string;
}

interface Facility {
  id: string;
  name: string;
  slug: string;
  type: string;
  tier: string | null;
  region: { name: string };
  district: { name: string };
  averageRating: number;
  totalReviews: number;
  nhisAccepted: boolean;
  emergencyCapable: boolean;
  ambulanceAvailable: boolean;
  bedCount: number | null;
  availableBeds: number | null;
  icuBedsAvailable: number | null;
  availableIcuBeds: number | null;
  services: Service[];
  equipment: string[];
  amenities: string[];
  specializations: string[];
  photos: string[];
}

const TIER_CONFIG: Record<string, { stars: number; label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
  FIVE_STAR: { stars: 5, label: "Tier 5 - Premier Teaching Hospital", color: "text-amber-600", bgColor: "bg-amber-50", icon: <Award className="w-5 h-5" /> },
  FOUR_STAR: { stars: 4, label: "Tier 4 - Regional Referral Hospital", color: "text-purple-600", bgColor: "bg-purple-50", icon: <Shield className="w-5 h-5" /> },
  THREE_STAR: { stars: 3, label: "Tier 3 - District Hospital", color: "text-blue-600", bgColor: "bg-blue-50", icon: <Building2 className="w-5 h-5" /> },
  TWO_STAR: { stars: 2, label: "Tier 2 - Health Centre", color: "text-emerald-600", bgColor: "bg-emerald-50", icon: <Home className="w-5 h-5" /> },
  ONE_STAR: { stars: 1, label: "Tier 1 - CHPS Compound", color: "text-gray-600", bgColor: "bg-gray-50", icon: <Home className="w-5 h-5" /> },
};

export default function ComparePage() {
  const [selectedFacilities, setSelectedFacilities] = useState<Facility[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<Facility[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    tier: true,
    services: true,
    equipment: true,
    amenities: true,
  });

  // Search facilities from API
  const searchFacilities = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const response = await fetch(`/api/facilities/compare?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      if (data.success) {
        setSearchResults(data.data.filter((f: Facility) => !selectedFacilities.find(sf => sf.id === f.id)));
      }
    } catch (error) {
      console.error("Error searching facilities:", error);
    } finally {
      setIsSearching(false);
    }
  }, [selectedFacilities]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (searchQuery) {
        searchFacilities(searchQuery);
      }
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, searchFacilities]);

  const addFacility = (facility: Facility) => {
    if (selectedFacilities.length < 3 && !selectedFacilities.find(f => f.id === facility.id)) {
      setSelectedFacilities([...selectedFacilities, facility]);
      setShowSearch(false);
      setSearchQuery("");
      setSearchResults([]);
    }
  };

  const removeFacility = (id: string) => {
    setSelectedFacilities(selectedFacilities.filter(f => f.id !== id));
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Get all unique services across selected facilities
  const getAllServices = () => {
    const serviceMap = new Map<string, { name: string; category: string | null }>();
    selectedFacilities.forEach(f => {
      f.services?.forEach(s => {
        if (!serviceMap.has(s.name)) {
          serviceMap.set(s.name, { name: s.name, category: s.category });
        }
      });
    });
    return Array.from(serviceMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  };

  // Get all unique equipment across selected facilities
  const getAllEquipment = () => {
    const equipmentSet = new Set<string>();
    selectedFacilities.forEach(f => {
      f.equipment?.forEach(e => equipmentSet.add(e));
    });
    return Array.from(equipmentSet).sort();
  };

  // Get all unique amenities across selected facilities
  const getAllAmenities = () => {
    const amenitiesSet = new Set<string>();
    selectedFacilities.forEach(f => {
      f.amenities?.forEach(a => amenitiesSet.add(a));
    });
    return Array.from(amenitiesSet).sort();
  };

  // Check if facility has a service and get its price
  const getServicePrice = (facility: Facility, serviceName: string) => {
    const service = facility.services?.find(s => s.name === serviceName);
    return service ? { price: service.priceGhs, nhisCovered: service.nhisCovered } : null;
  };

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
                  <Card className="h-full shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-0">
                      {/* Facility Image */}
                      <div className="relative h-32 bg-gradient-to-br from-emerald-100 to-teal-50">
                        {selectedFacilities[index].photos?.[0] ? (
                          <Image
                            src={selectedFacilities[index].photos[0]}
                            alt={selectedFacilities[index].name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Building2 className="w-12 h-12 text-emerald-300" />
                          </div>
                        )}
                        <button
                          onClick={() => removeFacility(selectedFacilities[index].id)}
                          className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white rounded-full shadow-md transition-colors"
                        >
                          <X className="h-4 w-4 text-gray-600" />
                        </button>
                        {/* Tier Badge */}
                        {selectedFacilities[index].tier && TIER_CONFIG[selectedFacilities[index].tier!] && (
                          <div className={`absolute bottom-2 left-2 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${TIER_CONFIG[selectedFacilities[index].tier!].bgColor} ${TIER_CONFIG[selectedFacilities[index].tier!].color}`}>
                            {TIER_CONFIG[selectedFacilities[index].tier!].icon}
                            <span>Tier {TIER_CONFIG[selectedFacilities[index].tier!].stars}</span>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <Link href={`/facilities/${selectedFacilities[index].slug}`} className="hover:text-emerald-600">
                          <h3 className="font-semibold text-gray-900 line-clamp-1">{selectedFacilities[index].name}</h3>
                        </Link>
                        <p className="text-sm text-gray-500">{selectedFacilities[index].type.replace(/_/g, " ")}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                          <MapPin className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{selectedFacilities[index].region.name}</span>
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            <span className="text-sm font-medium">{selectedFacilities[index].averageRating.toFixed(1)}</span>
                            <span className="text-sm text-gray-400">({selectedFacilities[index].totalReviews})</span>
                          </div>
                          {selectedFacilities[index].nhisAccepted && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">NHIS</span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="h-full border-dashed border-2 bg-gray-50/50 hover:bg-gray-100/50 transition-colors">
                    <CardContent className="p-6 flex flex-col items-center justify-center min-h-[220px]">
                      <button
                        onClick={() => setShowSearch(true)}
                        className="flex flex-col items-center gap-3 text-gray-400 hover:text-emerald-600 transition-colors"
                      >
                        <div className="w-14 h-14 rounded-full border-2 border-dashed border-current flex items-center justify-center">
                          <Plus className="h-7 w-7" />
                        </div>
                        <span className="text-sm font-medium">Add Facility {index + 1}</span>
                        <span className="text-xs text-gray-400">Click to search</span>
                      </button>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            ))}
          </div>

          {/* Search Modal */}
          <AnimatePresence>
            {showSearch && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                onClick={() => setShowSearch(false)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Add Facility to Compare</h3>
                    <button onClick={() => setShowSearch(false)} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search by facility name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      autoFocus
                    />
                  </div>
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {isSearching ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                        <span className="ml-2 text-gray-500">Searching...</span>
                      </div>
                    ) : searchResults.length > 0 ? (
                      searchResults.map((facility) => (
                        <button
                          key={facility.id}
                          onClick={() => addFacility(facility)}
                          className="w-full p-3 text-left rounded-lg hover:bg-emerald-50 transition-colors border border-transparent hover:border-emerald-200"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{facility.name}</p>
                              <p className="text-sm text-gray-500">{facility.type.replace(/_/g, " ")} • {facility.region.name}</p>
                            </div>
                            {facility.tier && TIER_CONFIG[facility.tier] && (
                              <span className={`text-xs px-2 py-0.5 rounded-full ${TIER_CONFIG[facility.tier].bgColor} ${TIER_CONFIG[facility.tier].color}`}>
                                Tier {TIER_CONFIG[facility.tier].stars}
                              </span>
                            )}
                          </div>
                        </button>
                      ))
                    ) : searchQuery.length >= 2 ? (
                      <p className="text-center text-gray-500 py-8">No facilities found matching "{searchQuery}"</p>
                    ) : (
                      <p className="text-center text-gray-400 py-8">Type at least 2 characters to search</p>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Comparison Sections */}
          {selectedFacilities.length >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Section 1: Tier Comparison */}
              <Card className="shadow-lg overflow-hidden">
                <button
                  onClick={() => toggleSection("tier")}
                  className="w-full px-6 py-4 bg-gradient-to-r from-amber-50 to-yellow-50 border-b flex items-center justify-between hover:from-amber-100 hover:to-yellow-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                      <Award className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900">Facility Tier</h3>
                      <p className="text-sm text-gray-500">Compare facility classifications and ratings</p>
                    </div>
                  </div>
                  {expandedSections.tier ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </button>
                <AnimatePresence>
                  {expandedSections.tier && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <CardContent className="p-0">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                              <tr>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 w-48">Attribute</th>
                                {selectedFacilities.map((f) => (
                                  <th key={f.id} className="px-6 py-3 text-left text-sm font-medium text-gray-900 min-w-[200px]">
                                    {f.name}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              <tr className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm text-gray-600 font-medium">Tier Level</td>
                                {selectedFacilities.map((f) => {
                                  const tierConfig = f.tier ? TIER_CONFIG[f.tier] : null;
                                  return (
                                    <td key={f.id} className="px-6 py-4">
                                      {tierConfig ? (
                                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${tierConfig.bgColor}`}>
                                          {tierConfig.icon}
                                          <div className="flex items-center gap-1">
                                            {Array.from({ length: tierConfig.stars }).map((_, i) => (
                                              <Star key={i} className={`w-4 h-4 ${tierConfig.color} fill-current`} />
                                            ))}
                                          </div>
                                        </div>
                                      ) : (
                                        <span className="text-gray-400">Not classified</span>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                              <tr className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm text-gray-600 font-medium">Classification</td>
                                {selectedFacilities.map((f) => (
                                  <td key={f.id} className="px-6 py-4 text-sm">
                                    {f.tier && TIER_CONFIG[f.tier] ? (
                                      <span className={TIER_CONFIG[f.tier].color}>{TIER_CONFIG[f.tier].label}</span>
                                    ) : (
                                      <span className="text-gray-400">—</span>
                                    )}
                                  </td>
                                ))}
                              </tr>
                              <tr className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm text-gray-600 font-medium">Rating</td>
                                {selectedFacilities.map((f) => (
                                  <td key={f.id} className="px-6 py-4">
                                    <div className="flex items-center gap-1">
                                      <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                                      <span className="font-semibold text-lg">{f.averageRating.toFixed(1)}</span>
                                      <span className="text-gray-400 text-sm">({f.totalReviews} reviews)</span>
                                    </div>
                                  </td>
                                ))}
                              </tr>
                              <tr className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm text-gray-600 font-medium">Bed Capacity</td>
                                {selectedFacilities.map((f) => (
                                  <td key={f.id} className="px-6 py-4">
                                    <span className="font-semibold">{f.bedCount || "—"}</span>
                                    {f.availableBeds !== null && (
                                      <span className="text-emerald-600 text-sm ml-2">({f.availableBeds} available)</span>
                                    )}
                                  </td>
                                ))}
                              </tr>
                              <tr className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm text-gray-600 font-medium">ICU Beds</td>
                                {selectedFacilities.map((f) => (
                                  <td key={f.id} className="px-6 py-4">
                                    <span className="font-semibold">{f.icuBedsAvailable || "—"}</span>
                                    {f.availableIcuBeds !== null && (
                                      <span className="text-emerald-600 text-sm ml-2">({f.availableIcuBeds} available)</span>
                                    )}
                                  </td>
                                ))}
                              </tr>
                              <tr className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm text-gray-600 font-medium">NHIS Accepted</td>
                                {selectedFacilities.map((f) => (
                                  <td key={f.id} className="px-6 py-4">
                                    {f.nhisAccepted ? (
                                      <span className="inline-flex items-center gap-1 text-green-600">
                                        <Check className="h-5 w-5" /> Yes
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 text-gray-400">
                                        <Minus className="h-5 w-5" /> No
                                      </span>
                                    )}
                                  </td>
                                ))}
                              </tr>
                              <tr className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm text-gray-600 font-medium">Emergency Services</td>
                                {selectedFacilities.map((f) => (
                                  <td key={f.id} className="px-6 py-4">
                                    {f.emergencyCapable ? (
                                      <span className="inline-flex items-center gap-1 text-red-600">
                                        <Activity className="h-5 w-5" /> 24/7 Available
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 text-gray-400">
                                        <Minus className="h-5 w-5" /> Not Available
                                      </span>
                                    )}
                                  </td>
                                ))}
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>

              {/* Section 2: Services & Pricing */}
              <Card className="shadow-lg overflow-hidden">
                <button
                  onClick={() => toggleSection("services")}
                  className="w-full px-6 py-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-b flex items-center justify-between hover:from-emerald-100 hover:to-teal-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900">Services & Pricing</h3>
                      <p className="text-sm text-gray-500">Compare available services and their costs</p>
                    </div>
                  </div>
                  {expandedSections.services ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </button>
                <AnimatePresence>
                  {expandedSections.services && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <CardContent className="p-0">
                        <div className="overflow-x-auto max-h-96">
                          <table className="w-full">
                            <thead className="bg-gray-50 border-b sticky top-0">
                              <tr>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 w-48">Service</th>
                                {selectedFacilities.map((f) => (
                                  <th key={f.id} className="px-6 py-3 text-left text-sm font-medium text-gray-900 min-w-[180px]">
                                    {f.name}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {getAllServices().length > 0 ? (
                                getAllServices().map((service) => (
                                  <tr key={service.name} className="hover:bg-gray-50">
                                    <td className="px-6 py-3">
                                      <div>
                                        <p className="text-sm font-medium text-gray-900">{service.name}</p>
                                        {service.category && (
                                          <p className="text-xs text-gray-500">{service.category}</p>
                                        )}
                                      </div>
                                    </td>
                                    {selectedFacilities.map((f) => {
                                      const serviceData = getServicePrice(f, service.name);
                                      return (
                                        <td key={f.id} className="px-6 py-3">
                                          {serviceData ? (
                                            <div>
                                              <p className="font-semibold text-emerald-600">
                                                GH₵ {Number(serviceData.price).toFixed(2)}
                                              </p>
                                              {serviceData.nhisCovered !== "NO" && (
                                                <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full mt-1">
                                                  <Check className="w-3 h-3" /> NHIS
                                                </span>
                                              )}
                                            </div>
                                          ) : (
                                            <span className="text-gray-300">—</span>
                                          )}
                                        </td>
                                      );
                                    })}
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={selectedFacilities.length + 1} className="px-6 py-8 text-center text-gray-500">
                                    No services data available for comparison
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>

              {/* Section 3: Medical Equipment */}
              <Card className="shadow-lg overflow-hidden">
                <button
                  onClick={() => toggleSection("equipment")}
                  className="w-full px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b flex items-center justify-between hover:from-blue-100 hover:to-indigo-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Wrench className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900">Medical Equipment</h3>
                      <p className="text-sm text-gray-500">Compare available medical equipment and technology</p>
                    </div>
                  </div>
                  {expandedSections.equipment ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </button>
                <AnimatePresence>
                  {expandedSections.equipment && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <CardContent className="p-0">
                        <div className="overflow-x-auto max-h-80">
                          <table className="w-full">
                            <thead className="bg-gray-50 border-b sticky top-0">
                              <tr>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 w-48">Equipment</th>
                                {selectedFacilities.map((f) => (
                                  <th key={f.id} className="px-6 py-3 text-center text-sm font-medium text-gray-900 min-w-[150px]">
                                    {f.name}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {getAllEquipment().length > 0 ? (
                                getAllEquipment().map((equipment) => (
                                  <tr key={equipment} className="hover:bg-gray-50">
                                    <td className="px-6 py-3 text-sm text-gray-900">{equipment}</td>
                                    {selectedFacilities.map((f) => (
                                      <td key={f.id} className="px-6 py-3 text-center">
                                        {f.equipment?.includes(equipment) ? (
                                          <Check className="h-5 w-5 text-green-500 mx-auto" />
                                        ) : (
                                          <Minus className="h-5 w-5 text-gray-300 mx-auto" />
                                        )}
                                      </td>
                                    ))}
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={selectedFacilities.length + 1} className="px-6 py-8 text-center text-gray-500">
                                    No equipment data available for comparison
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>

              {/* Section 4: Facilities & Amenities */}
              <Card className="shadow-lg overflow-hidden">
                <button
                  onClick={() => toggleSection("amenities")}
                  className="w-full px-6 py-4 bg-gradient-to-r from-purple-50 to-pink-50 border-b flex items-center justify-between hover:from-purple-100 hover:to-pink-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <Building className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900">Facilities & Amenities</h3>
                      <p className="text-sm text-gray-500">Compare available facilities and amenities</p>
                    </div>
                  </div>
                  {expandedSections.amenities ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </button>
                <AnimatePresence>
                  {expandedSections.amenities && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <CardContent className="p-0">
                        <div className="overflow-x-auto max-h-80">
                          <table className="w-full">
                            <thead className="bg-gray-50 border-b sticky top-0">
                              <tr>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 w-48">Amenity</th>
                                {selectedFacilities.map((f) => (
                                  <th key={f.id} className="px-6 py-3 text-center text-sm font-medium text-gray-900 min-w-[150px]">
                                    {f.name}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {getAllAmenities().length > 0 ? (
                                getAllAmenities().map((amenity) => (
                                  <tr key={amenity} className="hover:bg-gray-50">
                                    <td className="px-6 py-3 text-sm text-gray-900">{amenity}</td>
                                    {selectedFacilities.map((f) => (
                                      <td key={f.id} className="px-6 py-3 text-center">
                                        {f.amenities?.includes(amenity) ? (
                                          <Check className="h-5 w-5 text-green-500 mx-auto" />
                                        ) : (
                                          <Minus className="h-5 w-5 text-gray-300 mx-auto" />
                                        )}
                                      </td>
                                    ))}
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={selectedFacilities.length + 1} className="px-6 py-8 text-center text-gray-500">
                                    No amenities data available for comparison
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          )}

          {selectedFacilities.length < 2 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Facilities to Compare</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Add at least 2 facilities above to see a detailed comparison of their tiers, services, equipment, and amenities.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
