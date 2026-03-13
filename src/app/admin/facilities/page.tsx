import { db } from "@/lib/db";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PageProps {
  searchParams: { status?: string; type?: string; region?: string };
}

async function getFacilities(status?: string, type?: string, region?: string) {
  const where: any = {};
  
  if (status) {
    where.status = status.toUpperCase();
  }
  if (type) {
    where.type = type;
  }
  if (region) {
    where.region = { code: region };
  }

  return db.facility.findMany({
    where,
    include: { region: true, district: true },
    orderBy: { createdAt: "desc" },
  });
}

export default async function AdminFacilitiesPage({ searchParams }: PageProps) {
  const facilities = await getFacilities(
    searchParams.status,
    searchParams.type,
    searchParams.region
  );

  const statusCounts = await db.facility.groupBy({
    by: ["status"],
    _count: true,
  });

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-emerald-800 text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
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
            <nav className="flex items-center gap-6">
              <Link href="/admin" className="text-emerald-200 hover:text-white">Dashboard</Link>
              <Link href="/admin/facilities" className="text-white font-medium">Facilities</Link>
              <Link href="/admin/alerts" className="text-emerald-200 hover:text-white">Alerts</Link>
              <Link href="/admin/reports" className="text-emerald-200 hover:text-white">Reports</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Manage Facilities</h1>
        </div>

        {/* Status Tabs */}
        <div className="flex gap-2 mb-6">
          <Link
            href="/admin/facilities"
            className={`px-4 py-2 rounded-lg font-medium ${
              !searchParams.status ? "bg-emerald-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            All ({facilities.length})
          </Link>
          {statusCounts.map((s) => (
            <Link
              key={s.status}
              href={`/admin/facilities?status=${s.status.toLowerCase()}`}
              className={`px-4 py-2 rounded-lg font-medium ${
                searchParams.status?.toUpperCase() === s.status
                  ? "bg-emerald-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {s.status} ({s._count})
            </Link>
          ))}
        </div>

        {/* Facilities Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Facility</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Region</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">License</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {facilities.map((facility) => (
                    <tr key={facility.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{facility.name}</p>
                          <p className="text-sm text-gray-500">{facility.address}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {facility.type.replace("_", " ")}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {facility.region.name}
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-gray-600">
                        {facility.licenseNumber}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs rounded-full font-medium ${
                            facility.status === "APPROVED"
                              ? "bg-green-100 text-green-700"
                              : facility.status === "PENDING"
                              ? "bg-amber-100 text-amber-700"
                              : facility.status === "REJECTED"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {facility.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Link
                            href={`/admin/facilities/${facility.id}`}
                            className="text-emerald-600 hover:text-emerald-800 text-sm font-medium"
                          >
                            View
                          </Link>
                          {facility.status === "PENDING" && (
                            <>
                              <span className="text-gray-300">|</span>
                              <Link
                                href={`/admin/facilities/${facility.id}/approve`}
                                className="text-green-600 hover:text-green-800 text-sm font-medium"
                              >
                                Approve
                              </Link>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {facilities.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No facilities found
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
