import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: { id: string };
}

export default async function FacilityDetailPage({ params }: PageProps) {
  const facility = await db.facility.findUnique({
    where: { id: params.id },
    include: {
      region: true,
      district: true,
      services: true,
    },
  });

  if (!facility) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-emerald-800 text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="text-emerald-800 font-bold text-xl">A</span>
              </div>
              <div>
                <span className="text-xl font-bold">Apomuden</span>
                <span className="text-emerald-200 text-sm block">Ministry Admin</span>
              </div>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-6">
          <Link href="/admin" className="text-gray-500 hover:text-gray-700">Dashboard</Link>
          <span className="text-gray-400">/</span>
          <Link href="/admin/facilities" className="text-gray-500 hover:text-gray-700">Facilities</Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900">{facility.name}</span>
        </nav>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{facility.name}</CardTitle>
                <span
                  className={`px-3 py-1 text-sm rounded-full font-medium ${
                    facility.status === "APPROVED"
                      ? "bg-green-100 text-green-700"
                      : facility.status === "PENDING"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {facility.status}
                </span>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Type</p>
                    <p className="font-medium">{facility.type.replace("_", " ")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tier</p>
                    <p className="font-medium">{facility.tier?.replace("_", " ") || "Not assigned"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">License Number</p>
                    <p className="font-mono font-medium">{facility.licenseNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{facility.phone}</p>
                  </div>
                </div>

                {facility.description && (
                  <div>
                    <p className="text-sm text-gray-500">Description</p>
                    <p className="text-gray-700">{facility.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">{facility.address}</p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Region</p>
                    <p className="font-medium">{facility.region.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">District</p>
                    <p className="font-medium">{facility.district.name}</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Latitude</p>
                    <p className="font-mono">{facility.latitude}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Longitude</p>
                    <p className="font-mono">{facility.longitude}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Capabilities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className={`p-4 rounded-lg ${facility.nhisAccepted ? "bg-green-50" : "bg-gray-50"}`}>
                    <p className="font-medium">{facility.nhisAccepted ? "✓" : "✗"} NHIS Accepted</p>
                  </div>
                  <div className={`p-4 rounded-lg ${facility.emergencyCapable ? "bg-green-50" : "bg-gray-50"}`}>
                    <p className="font-medium">{facility.emergencyCapable ? "✓" : "✗"} Emergency Services</p>
                  </div>
                  <div className={`p-4 rounded-lg ${facility.ambulanceAvailable ? "bg-green-50" : "bg-gray-50"}`}>
                    <p className="font-medium">{facility.ambulanceAvailable ? "✓" : "✗"} Ambulance</p>
                  </div>
                </div>
                {facility.bedCount && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">Bed Capacity</p>
                    <p className="font-medium">{facility.bedCount} beds</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Actions */}
          <div className="space-y-6">
            {facility.status === "PENDING" && (
              <Card>
                <CardHeader>
                  <CardTitle>Review Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <form action={`/api/admin/facilities/${facility.id}/approve`} method="POST">
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      ✓ Approve Facility
                    </Button>
                  </form>
                  <form action={`/api/admin/facilities/${facility.id}/reject`} method="POST">
                    <Button variant="outline" className="w-full text-red-600 border-red-600 hover:bg-red-50">
                      ✗ Reject Facility
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {facility.status === "APPROVED" && (
              <Card>
                <CardHeader>
                  <CardTitle>Assign Tier</CardTitle>
                </CardHeader>
                <CardContent>
                  <select className="w-full p-3 border rounded-lg mb-3">
                    <option value="">Select tier...</option>
                    <option value="FIVE_STAR">5 Star</option>
                    <option value="FOUR_STAR">4 Star</option>
                    <option value="THREE_STAR">3 Star</option>
                    <option value="TWO_STAR">2 Star</option>
                    <option value="ONE_STAR">1 Star</option>
                  </select>
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                    Update Tier
                  </Button>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link
                  href={`/facilities/${facility.slug}`}
                  target="_blank"
                  className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 text-sm"
                >
                  View Public Profile →
                </Link>
                <a
                  href={`https://www.google.com/maps?q=${facility.latitude},${facility.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 text-sm"
                >
                  View on Google Maps →
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Audit Info</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div>
                  <p className="text-gray-500">Created</p>
                  <p suppressHydrationWarning>{facility.createdAt.toLocaleDateString('en-GB')}</p>
                </div>
                <div>
                  <p className="text-gray-500">Last Updated</p>
                  <p suppressHydrationWarning>{facility.updatedAt.toLocaleDateString('en-GB')}</p>
                </div>
                {facility.verifiedAt && (
                  <div>
                    <p className="text-gray-500">Verified</p>
                    <p suppressHydrationWarning>{facility.verifiedAt.toLocaleDateString('en-GB')}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
