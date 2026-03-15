import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/facilities/[id]/stats - Get facility visit statistics and top diagnoses
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const facilityId = params.id;
    
    // Get date range for current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    let visitCount = 0;
    let formattedDiagnoses: { rank: number; diseaseCode: string; diseaseName: string; caseCount: number }[] = [];

    // Try to get visit statistics - handle case where table doesn't exist
    try {
      const visitStats = await db.$queryRaw<{ total_visits: number }[]>`
        SELECT COALESCE(SUM(visit_count), 0)::int as total_visits
        FROM facility_visits
        WHERE facility_id = ${facilityId}::uuid
        AND visit_date >= ${startOfMonth}
        AND visit_date <= ${endOfMonth}
      `;
      visitCount = visitStats[0]?.total_visits || 0;
    } catch {
      // Table doesn't exist yet, use default value
      visitCount = 0;
    }
    
    // Try to get top diagnoses from diagnosis reports
    try {
      const topDiagnoses = await db.diagnosisReport.groupBy({
        by: ['diseaseCode', 'diseaseName'],
        where: {
          facilityId: facilityId,
          periodStart: {
            gte: startOfMonth,
          },
          periodEnd: {
            lte: endOfMonth,
          },
        },
        _sum: {
          caseCount: true,
        },
        orderBy: {
          _sum: {
            caseCount: 'desc',
          },
        },
        take: 5,
      });

      formattedDiagnoses = topDiagnoses.map((d, index) => ({
        rank: index + 1,
        diseaseCode: d.diseaseCode,
        diseaseName: d.diseaseName,
        caseCount: d._sum.caseCount || 0,
      }));
    } catch {
      // No diagnosis data available
      formattedDiagnoses = [];
    }

    return NextResponse.json({
      facilityId,
      period: {
        start: startOfMonth.toISOString().split('T')[0],
        end: endOfMonth.toISOString().split('T')[0],
        type: 'MONTHLY',
      },
      visitCount,
      topDiagnoses: formattedDiagnoses,
    });
  } catch (error) {
    console.error("Error fetching facility stats:", error);
    // Return empty stats instead of error to prevent UI breaking
    return NextResponse.json({
      facilityId: params.id,
      period: {
        start: new Date().toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0],
        type: 'MONTHLY',
      },
      visitCount: 0,
      topDiagnoses: [],
    });
  }
}
