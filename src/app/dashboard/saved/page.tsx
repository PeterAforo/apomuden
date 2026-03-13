"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Heart, 
  MapPin, 
  Star, 
  Phone, 
  Loader2, 
  Building2,
  Trash2,
  ExternalLink
} from "lucide-react";

interface SavedFacility {
  id: string;
  name: string;
  slug: string;
  type: string;
  address: string;
  phone: string;
  averageRating: number;
  totalReviews: number;
  nhisAccepted: boolean;
  emergencyCapable: boolean;
  region: { name: string };
  district: { name: string };
}

export default function SavedFacilitiesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [facilities, setFacilities] = useState<SavedFacility[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated") {
      fetchSavedFacilities();
    }
  }, [status, router]);

  const fetchSavedFacilities = async () => {
    try {
      const response = await fetch("/api/user/favorites");
      if (response.ok) {
        const data = await response.json();
        setFacilities(data.favorites);
      }
    } catch (error) {
      console.error("Error fetching saved facilities:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (facilityId: string) => {
    setRemoving(facilityId);
    try {
      const response = await fetch(`/api/user/favorites?facilityId=${facilityId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setFacilities(prev => prev.filter(f => f.id !== facilityId));
      }
    } catch (error) {
      console.error("Error removing facility:", error);
    } finally {
      setRemoving(null);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3">
            <Heart className="h-8 w-8 fill-white" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Saved Facilities</h1>
              <p className="text-emerald-100 mt-1">Your favorite healthcare facilities</p>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        {facilities.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Building2 className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h2 className="text-xl font-semibold text-gray-700 mb-2">No saved facilities yet</h2>
              <p className="text-gray-500 mb-6">
                Save facilities you visit frequently for quick access
              </p>
              <Link href="/facilities">
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  Browse Facilities
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {facilities.map((facility) => (
              <Card key={facility.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-500" />
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
                          {facility.name}
                        </h3>
                        <p className="text-sm text-emerald-600 font-medium">
                          {facility.type.replace("_", " ")}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemove(facility.id)}
                        disabled={removing === facility.id}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        title="Remove from saved"
                      >
                        {removing === facility.id ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Trash2 className="h-5 w-5" />
                        )}
                      </button>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="line-clamp-1">{facility.district.name}, {facility.region.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <a href={`tel:${facility.phone}`} className="text-emerald-600 hover:underline">
                          {facility.phone}
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span>{facility.averageRating.toFixed(1)} ({facility.totalReviews} reviews)</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {facility.nhisAccepted && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          NHIS
                        </span>
                      )}
                      {facility.emergencyCapable && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                          Emergency
                        </span>
                      )}
                    </div>

                    <Link href={`/facilities/${facility.slug}`}>
                      <Button variant="outline" className="w-full" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
