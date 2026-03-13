import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

interface PageProps {
  params: { slug: string };
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

export default async function FacilityDetailPage({ params }: PageProps) {
  const facility = await db.facility.findUnique({
    where: { slug: params.slug },
    include: {
      region: true,
      district: true,
      services: {
        where: { isActive: true },
        take: 10,
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 text-white">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm text-emerald-100 mb-6">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span className="text-emerald-300">/</span>
            <Link href="/facilities" className="hover:text-white transition-colors">Facilities</Link>
            <span className="text-emerald-300">/</span>
            <span className="text-white font-medium">{facility.name}</span>
          </nav>
          
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 pb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-4xl font-bold">
                  {facility.name}
                </h1>
                {facility.tier && (
                  <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <span className="text-yellow-300 font-bold">
                      {getTierStars(facility.tier)}★
                    </span>
                  </div>
                )}
              </div>
              <p className="text-emerald-100 text-lg">
                {facility.type.replace("_", " ")} • {facility.region.name}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {facility.nhisAccepted && (
                <span className="px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white text-sm rounded-full font-medium border border-white/30">
                  ✓ NHIS Accepted
                </span>
              )}
              {facility.emergencyCapable && (
                <span className="px-3 py-1.5 bg-red-500/80 backdrop-blur-sm text-white text-sm rounded-full font-medium">
                  🚨 Emergency
                </span>
              )}
              {facility.ambulanceAvailable && (
                <span className="px-3 py-1.5 bg-blue-500/80 backdrop-blur-sm text-white text-sm rounded-full font-medium">
                  🚑 Ambulance
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 -mt-4">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Stats Card */}
            <Card className="shadow-lg border-0 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-center gap-1 text-2xl font-bold text-gray-900">
                      <span className="text-yellow-500">★</span>
                      {facility.averageRating.toFixed(1)}
                    </div>
                    <p className="text-sm text-gray-500">{facility.totalReviews} reviews</p>
                  </div>
                  {facility.bedCount && (
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <div className="text-2xl font-bold text-gray-900">{facility.bedCount}</div>
                      <p className="text-sm text-gray-500">Total Beds</p>
                    </div>
                  )}
                  {facility.icuBedsAvailable && (
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <div className="text-2xl font-bold text-gray-900">{facility.icuBedsAvailable}</div>
                      <p className="text-sm text-gray-500">ICU Beds</p>
                    </div>
                  )}
                  <div className="text-center p-4 bg-emerald-50 rounded-xl">
                    <div className="text-2xl font-bold text-emerald-600">Open</div>
                    <p className="text-sm text-gray-500">Status</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            {facility.description && (
              <Card>
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{facility.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Services */}
            {facility.services.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Services Offered</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-3">
                    {facility.services.map((service) => (
                      <div
                        key={service.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{service.name}</p>
                          <p className="text-sm text-gray-500">{service.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-emerald-600">
                            GH₵ {Number(service.priceGhs).toFixed(2)}
                          </p>
                          {service.nhisCovered !== "NO" && (
                            <span className="text-xs text-green-600">NHIS</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews */}
            {facility.reviews.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {facility.reviews.map((review) => (
                      <div key={review.id} className="border-b pb-4 last:border-0">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{review.citizen.name}</span>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span
                                key={star}
                                className={star <= review.rating ? "text-yellow-400" : "text-gray-300"}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                        {review.text && (
                          <p className="text-gray-600 text-sm">{review.text}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">{facility.address}</p>
                  <p className="text-sm text-gray-600">
                    {facility.district.name}, {facility.region.name}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <a href={`tel:${facility.phone}`} className="font-medium text-emerald-600">
                    {facility.phone}
                  </a>
                </div>

                {facility.email && (
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <a href={`mailto:${facility.email}`} className="font-medium text-emerald-600">
                      {facility.email}
                    </a>
                  </div>
                )}

                {facility.website && (
                  <div>
                    <p className="text-sm text-gray-500">Website</p>
                    <a
                      href={facility.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-emerald-600"
                    >
                      Visit Website
                    </a>
                  </div>
                )}

                <div className="pt-4 space-y-2">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                    Call Now
                  </Button>
                  <Button variant="outline" className="w-full">
                    Get Directions
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Operating Hours */}
            {operatingHours && (
              <Card>
                <CardHeader>
                  <CardTitle>Operating Hours</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map(
                      (day) => {
                        const hours = operatingHours[day];
                        const isOpen = hours?.open && hours?.close;
                        return (
                          <div key={day} className="flex justify-between text-sm">
                            <span className="capitalize text-gray-600">{day}</span>
                            <span className={isOpen ? "text-gray-900" : "text-gray-400"}>
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

            {/* Map */}
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-2">
                      <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-600">{facility.latitude.toFixed(4)}, {facility.longitude.toFixed(4)}</p>
                    <a
                      href={`https://www.google.com/maps?q=${facility.latitude},${facility.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-emerald-600 hover:underline mt-1 inline-block"
                    >
                      Open in Google Maps
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
