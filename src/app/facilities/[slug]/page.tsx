import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { FacilityReviews } from "@/components/reviews";
import { FavoriteButton } from "@/components/favorites";
import { FacilityImageGallery, FacilityLocationMap, TierBadge, TierCard, FacilityStats } from "@/components/facilities";
import { 
  Phone, Mail, Globe, Clock, MapPin, Bed, Heart, 
  Stethoscope, Activity, Ambulance, Shield, Share2, 
  Printer, ChevronRight, CheckCircle2, XCircle
} from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { slug: string };
}

interface FacilityService {
  id: string;
  name: string;
  category: string | null;
  priceGhs: { toNumber: () => number } | number;
  nhisCovered: string;
}

interface FacilityReview {
  id: string;
  rating: number;
  text: string | null;
  citizen: {
    name: string;
  };
}

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

function formatFacilityType(type: string): string {
  return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

export default async function FacilityDetailPage({ params }: PageProps) {
  const facility = await db.facility.findUnique({
    where: { slug: params.slug },
    include: {
      region: true,
      district: true,
      services: {
        where: { isActive: true },
        take: 20,
      },
      reviews: {
        where: { status: "ACTIVE" },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          citizen: {
            select: { name: true },
          },
        },
      },
    },
  });

  if (!facility) {
    notFound();
  }

  const operatingHours = facility.operatingHours as Record<string, { open: string; close: string }> | null;
  const photos = (facility.photos as string[]) || [];
  const amenities = (facility.amenities as string[]) || [];
  const equipment = (facility.equipment as string[]) || [];
  const specializations = (facility.specializations as string[]) || [];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 text-white">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm text-emerald-100 mb-6">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4 text-emerald-300" />
            <Link href="/facilities" className="hover:text-white transition-colors">Facilities</Link>
            <ChevronRight className="w-4 h-4 text-emerald-300" />
            <span className="text-white font-medium truncate max-w-[200px]">{facility.name}</span>
          </nav>
          
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 pb-6">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-4xl font-bold">
                  {facility.name}
                </h1>
                <TierBadge tier={facility.tier} size="md" />
              </div>
              <p className="text-emerald-100 text-lg flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {formatFacilityType(facility.type)} • {facility.region.name}
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <FavoriteButton facilityId={facility.id} />
              <button className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors" title="Share">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors" title="Print">
                <Printer className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Feature Badges */}
          <div className="flex flex-wrap gap-2 pb-4">
            {facility.nhisAccepted && (
              <span className="px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white text-sm rounded-full font-medium border border-white/30 flex items-center gap-1.5">
                <Shield className="w-4 h-4" /> NHIS Accepted
              </span>
            )}
            {facility.emergencyCapable && (
              <span className="px-3 py-1.5 bg-red-500/80 backdrop-blur-sm text-white text-sm rounded-full font-medium flex items-center gap-1.5">
                <Activity className="w-4 h-4" /> 24/7 Emergency
              </span>
            )}
            {facility.ambulanceAvailable && (
              <span className="px-3 py-1.5 bg-blue-500/80 backdrop-blur-sm text-white text-sm rounded-full font-medium flex items-center gap-1.5">
                <Ambulance className="w-4 h-4" /> Ambulance Service
              </span>
            )}
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 -mt-4">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card className="shadow-lg border-0 overflow-hidden">
              <CardContent className="p-4">
                <FacilityImageGallery images={photos} facilityName={facility.name} />
              </CardContent>
            </Card>

            {/* Quick Stats Card */}
            <Card className="shadow-lg border-0 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl border border-yellow-100">
                    <div className="flex items-center justify-center gap-1 text-2xl font-bold text-gray-900">
                      <span className="text-yellow-500">★</span>
                      {facility.averageRating.toFixed(1)}
                    </div>
                    <p className="text-sm text-gray-500">{facility.totalReviews} reviews</p>
                  </div>
                  {facility.bedCount && (
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                      <div className="flex items-center justify-center gap-1">
                        <Bed className="w-5 h-5 text-blue-500" />
                        <span className="text-2xl font-bold text-gray-900">{facility.bedCount}</span>
                      </div>
                      <p className="text-sm text-gray-500">Total Beds</p>
                      {facility.availableBeds !== null && (
                        <p className="text-xs text-emerald-600 font-medium mt-1">
                          {facility.availableBeds} available
                        </p>
                      )}
                    </div>
                  )}
                  {facility.icuBedsAvailable && (
                    <div className="text-center p-4 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl border border-red-100">
                      <div className="flex items-center justify-center gap-1">
                        <Heart className="w-5 h-5 text-red-500" />
                        <span className="text-2xl font-bold text-gray-900">{facility.icuBedsAvailable}</span>
                      </div>
                      <p className="text-sm text-gray-500">ICU Beds</p>
                      {facility.availableIcuBeds !== null && (
                        <p className="text-xs text-emerald-600 font-medium mt-1">
                          {facility.availableIcuBeds} available
                        </p>
                      )}
                    </div>
                  )}
                  <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                    <div className="flex items-center justify-center gap-1">
                      <Clock className="w-5 h-5 text-emerald-500" />
                      <span className="text-2xl font-bold text-emerald-600">Open</span>
                    </div>
                    <p className="text-sm text-gray-500">24/7 Service</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tier Information */}
            {facility.tier && (
              <TierCard tier={facility.tier} />
            )}

            {/* Facility Statistics */}
            <FacilityStats facilityId={facility.id} />

            {/* Description */}
            {facility.description && (
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-emerald-600" />
                    About This Facility
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{facility.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Specializations */}
            {specializations.length > 0 && (
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-600" />
                    Medical Specializations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {specializations.map((spec, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium border border-emerald-200"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Services */}
            {facility.services.length > 0 && (
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Stethoscope className="w-5 h-5 text-emerald-600" />
                      Services & Pricing
                    </span>
                    <span className="text-sm font-normal text-gray-500">
                      {facility.services.length} services
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-3">
                    {facility.services.map((service: FacilityService) => (
                      <div
                        key={service.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
                      >
                        <div>
                          <p className="font-medium text-gray-900 group-hover:text-emerald-700 transition-colors">
                            {service.name}
                          </p>
                          <p className="text-sm text-gray-500">{service.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-emerald-600">
                            GH₵ {typeof service.priceGhs === 'object' ? service.priceGhs.toNumber().toFixed(2) : Number(service.priceGhs).toFixed(2)}
                          </p>
                          {service.nhisCovered !== "NO" && (
                            <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3" /> NHIS
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Equipment */}
            {equipment.length > 0 && (
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle>Medical Equipment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {equipment.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg text-sm text-blue-700"
                      >
                        <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Amenities */}
            {amenities.length > 0 && (
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle>Facilities & Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {amenities.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg text-sm text-purple-700"
                      >
                        <CheckCircle2 className="w-4 h-4 text-purple-500 flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews Section */}
            <FacilityReviews facilityId={facility.id} facilityName={facility.name} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card className="shadow-lg sticky top-4">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-emerald-600" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">{facility.address}</p>
                    <p className="text-sm text-gray-600">
                      {facility.district.name}, {facility.region.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <a href={`tel:${facility.phone}`} className="font-medium text-emerald-600 hover:underline">
                    {facility.phone}
                  </a>
                </div>

                {facility.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <a href={`mailto:${facility.email}`} className="font-medium text-emerald-600 hover:underline truncate">
                      {facility.email}
                    </a>
                  </div>
                )}

                {facility.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <a
                      href={facility.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-emerald-600 hover:underline"
                    >
                      Visit Website
                    </a>
                  </div>
                )}

                <div className="pt-4 space-y-2">
                  <a href={`tel:${facility.phone}`}>
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700 gap-2">
                      <Phone className="w-4 h-4" />
                      Call Now
                    </Button>
                  </a>
                  {facility.emergencyCapable && (
                    <Button variant="destructive" className="w-full gap-2">
                      <Activity className="w-4 h-4" />
                      Emergency Line
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Operating Hours */}
            {operatingHours && (
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-emerald-600" />
                    Operating Hours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map(
                      (day) => {
                        const hours = operatingHours[day];
                        const isOpen = hours?.open && hours?.close;
                        const isToday = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase() === day;
                        return (
                          <div 
                            key={day} 
                            className={`flex justify-between text-sm p-2 rounded-lg ${
                              isToday ? "bg-emerald-50 border border-emerald-200" : ""
                            }`}
                          >
                            <span className={`capitalize ${isToday ? "font-semibold text-emerald-700" : "text-gray-600"}`}>
                              {day} {isToday && <span className="text-xs">(Today)</span>}
                            </span>
                            <span className={isOpen ? (isToday ? "text-emerald-700 font-medium" : "text-gray-900") : "text-gray-400"}>
                              {isOpen ? `${hours.open} - ${hours.close}` : "Closed"}
                            </span>
                          </div>
                        );
                      }
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Interactive Map */}
            <Card className="shadow-md overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <FacilityLocationMap
                  latitude={facility.latitude}
                  longitude={facility.longitude}
                  facilityName={facility.name}
                  facilityType={facility.type}
                  address={facility.address}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
