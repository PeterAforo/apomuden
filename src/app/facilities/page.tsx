"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Search, Map, List, Grid, Loader2 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import dynamic from "next/dynamic";

const FacilityMap = dynamic(() => import("@/components/maps/FacilityMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-gray-100 rounded-xl animate-pulse flex items-center justify-center">
      <p className="text-gray-500">Loading map...</p>
    </div>
  ),
});

interface Facility {
  id: string;
  name: string;
  slug: string;
  type: string;
  tier: string | null;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  nhisAccepted: boolean;
  emergencyCapable: boolean;
  ambulanceAvailable: boolean;
  bedCount: number | null;
  averageRating: number;
  totalReviews: number;
  description: string | null;
  region: { name: string; code: string };
  district: { name: string };
}

const FACILITY_TYPES = [
  { value: "", label: "All Types" },
  { value: "HOSPITAL", label: "Hospital" },
  { value: "CLINIC", label: "Clinic" },
  { value: "PHARMACY", label: "Pharmacy" },
  { value: "DIAGNOSTIC_CENTRE", label: "Diagnostic Centre" },
  { value: "POLYCLINIC", label: "Polyclinic" },
  { value: "HEALTH_CENTRE", label: "Health Centre" },
];

const REGIONS = [
  { value: "", label: "All Regions" },
  { value: "GA", label: "Greater Accra" },
  { value: "AS", label: "Ashanti" },
  { value: "WR", label: "Western" },
  { value: "CR", label: "Central" },
  { value: "ER", label: "Eastern" },
  { value: "VR", label: "Volta" },
  { value: "NR", label: "Northern" },
  { value: "UE", label: "Upper East" },
  { value: "UW", label: "Upper West" },
  { value: "BO", label: "Bono" },
  { value: "BE", label: "Bono East" },
];

function getTierStars(tier: string | null): number {
  if (!tier) return 0;
  const tierMap: Record<string, number> = {
    FIVE_STAR: 5,
    FOUR_STAR: 4,
    THREE_STAR: 3,
    TWO_STAR: 2,
    ONE_STAR: 1,
  };
  return tierMap[tier] || 0;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

const PAGE_SIZE = 12;

export default function FacilitiesPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [nhisOnly, setNhisOnly] = useState(false);
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list" | "map">("grid");
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null);
  
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Reset and fetch when filters change
  useEffect(() => {
    setPage(1);
    setFacilities([]);
    setHasMore(true);
    fetchFacilities(1, true);
  }, [selectedType, selectedRegion, nhisOnly, emergencyOnly]);

  const fetchFacilities = async (pageNum: number, reset = false) => {
    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("query", searchQuery);
      if (selectedType) params.set("type", selectedType);
      if (selectedRegion) params.set("region", selectedRegion);
      if (nhisOnly) params.set("nhis", "true");
      if (emergencyOnly) params.set("emergency", "true");
      params.set("page", pageNum.toString());
      params.set("pageSize", PAGE_SIZE.toString());

      const res = await fetch(`/api/facilities?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        const newItems = data.data.items;
        if (reset) {
          setFacilities(newItems);
        } else {
          setFacilities(prev => [...prev, ...newItems]);
        }
        setTotal(data.data.total);
        setHasMore(pageNum < data.data.totalPages);
        setPage(pageNum);
      }
    } catch (error) {
      console.error("Error fetching facilities:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Intersection Observer for infinite scroll
  const lastFacilityRef = useCallback((node: HTMLDivElement | null) => {
    if (loading || loadingMore) return;
    
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loadingMore) {
        fetchFacilities(page + 1);
      }
    }, { threshold: 0.1 });
    
    if (node) {
      observerRef.current.observe(node);
    }
  }, [loading, loadingMore, hasMore, page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setFacilities([]);
    setHasMore(true);
    fetchFacilities(1, true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      {/* Search Section */}
      <section className="bg-emerald-600 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-6">
            Find Healthcare Facilities in Ghana
          </h1>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="text"
              placeholder="Search by name, location, or service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-white"
            />
            <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white">
              Search
            </Button>
          </form>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-white border-b py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 sm:gap-4">
            {/* Filters Row */}
            <div className="flex flex-wrap gap-2 sm:gap-4">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="flex-1 sm:flex-none px-3 py-2 border rounded-lg text-base sm:text-sm min-h-[44px]"
              >
                {FACILITY_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>

              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="flex-1 sm:flex-none px-3 py-2 border rounded-lg text-base sm:text-sm min-h-[44px]"
              >
                {REGIONS.map((region) => (
                  <option key={region.value} value={region.value}>
                    {region.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Checkboxes Row */}
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm min-h-[44px]">
                <input
                  type="checkbox"
                  checked={nhisOnly}
                  onChange={(e) => setNhisOnly(e.target.checked)}
                  className="rounded w-5 h-5"
                />
                NHIS Accepted
              </label>

              <label className="flex items-center gap-2 text-sm min-h-[44px]">
                <input
                  type="checkbox"
                  checked={emergencyOnly}
                  onChange={(e) => setEmergencyOnly(e.target.checked)}
                  className="rounded w-5 h-5"
                />
                Emergency Services
              </label>
            </div>

            {/* Results count and view toggle */}
            <div className="flex items-center justify-between sm:justify-end gap-4 sm:ml-auto w-full sm:w-auto">
              <span className="text-sm text-gray-600">
                {total} facilities found
              </span>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2.5 rounded-md transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center ${
                    viewMode === "grid" ? "bg-white shadow-sm text-emerald-600" : "text-gray-500 hover:text-gray-700"
                  }`}
                  title="Grid view"
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2.5 rounded-md transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center ${
                    viewMode === "list" ? "bg-white shadow-sm text-emerald-600" : "text-gray-500 hover:text-gray-700"
                  }`}
                  title="List view"
                >
                  <List className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode("map")}
                  className={`p-2.5 rounded-md transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center ${
                    viewMode === "map" ? "bg-white shadow-sm text-emerald-600" : "text-gray-500 hover:text-gray-700"
                  }`}
                  title="Map view"
                >
                  <Map className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <main className="container mx-auto px-4 py-8 flex-1">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : facilities.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No facilities found matching your criteria.</p>
          </div>
        ) : viewMode === "map" ? (
          /* Map View */
          <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 lg:gap-6">
            <div className="lg:col-span-2 order-1">
              <FacilityMap
                facilities={facilities}
                showUserLocation
                showLegend
                selectedFacilityId={selectedFacilityId || undefined}
                onFacilityClick={(f) => setSelectedFacilityId(f.id)}
                className="h-[400px] sm:h-[500px] lg:h-[600px]"
              />
            </div>
            <div className="space-y-3 max-h-[300px] lg:max-h-[600px] overflow-y-auto order-2 -webkit-overflow-scrolling-touch">
              <h3 className="font-semibold text-gray-900 sticky top-0 bg-gray-50 py-2">
                Facilities ({facilities.length})
              </h3>
              {facilities.map((facility) => (
                <button
                  key={facility.id}
                  onClick={() => setSelectedFacilityId(facility.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedFacilityId === facility.id
                      ? "border-emerald-500 bg-emerald-50 shadow-md"
                      : "border-gray-200 bg-white hover:border-emerald-300 hover:shadow-sm"
                  }`}
                >
                  <h4 className="font-medium text-gray-900 text-sm line-clamp-1">{facility.name}</h4>
                  <p className="text-xs text-gray-500">{facility.type.replace("_", " ")}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-yellow-500 text-xs">★ {facility.averageRating.toFixed(1)}</span>
                    {facility.nhisAccepted && (
                      <span className="text-xs text-emerald-600">NHIS</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Grid/List View */
          <div className={viewMode === "grid" ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3" : "space-y-4"}>
            {facilities.map((facility, index) => (
              <Card 
                key={facility.id} 
                ref={index === facilities.length - 1 ? lastFacilityRef : null}
                className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-md"
              >
                {/* Card Header with gradient */}
                <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg text-gray-900 line-clamp-1 group-hover:text-emerald-600 transition-colors">
                        {facility.name}
                      </h3>
                      <p className="text-sm text-emerald-600 font-medium">
                        {facility.type.replace("_", " ")}
                      </p>
                    </div>
                    {facility.tier && (
                      <div className="flex items-center gap-1 bg-gradient-to-r from-amber-100 to-yellow-100 px-3 py-1.5 rounded-full text-xs shadow-sm">
                        <span className="text-amber-600 font-bold">
                          {getTierStars(facility.tier)}★
                        </span>
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex items-start gap-1.5">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    {facility.address}
                  </p>

                  <div className="flex items-center gap-2 mb-4 bg-gray-50 rounded-lg p-2">
                    <StarRating rating={Math.round(facility.averageRating)} />
                    <span className="text-sm text-gray-600 font-medium">
                      {facility.averageRating.toFixed(1)}
                    </span>
                    <span className="text-sm text-gray-400">
                      ({facility.totalReviews} reviews)
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {facility.nhisAccepted && (
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs rounded-full font-medium border border-emerald-200">
                        ✓ NHIS
                      </span>
                    )}
                    {facility.emergencyCapable && (
                      <span className="px-2.5 py-1 bg-red-50 text-red-700 text-xs rounded-full font-medium border border-red-200">
                        🚨 Emergency
                      </span>
                    )}
                    {facility.ambulanceAvailable && (
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium border border-blue-200">
                        🚑 Ambulance
                      </span>
                    )}
                    {facility.bedCount && (
                      <span className="px-2.5 py-1 bg-gray-50 text-gray-700 text-xs rounded-full font-medium border border-gray-200">
                        🛏️ {facility.bedCount} beds
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                      {facility.region.name}
                    </span>
                    <Link href={`/facilities/${facility.slug}`}>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Load More Indicator */}
        {loadingMore && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            <span className="ml-2 text-gray-600">Loading more facilities...</span>
          </div>
        )}

        {/* End of Results */}
        {!loading && !loadingMore && !hasMore && facilities.length > 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>You&apos;ve reached the end — {facilities.length} of {total} facilities shown</p>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
