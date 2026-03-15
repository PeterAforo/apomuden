import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// POST - Healthcare facility submits diagnosis data
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if user has facility admin role
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, facilityId: true },
    });

    if (!user || !["FACILITY_ADMIN", "ADMIN"].includes(user.role)) {
      return NextResponse.json(
        { error: "Unauthorized - Facility access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { 
      diseaseCode, 
      diseaseName, 
      patientAge, 
      patientGender,
      severity,
      outcome,
      district,
      region,
      facilityId 
    } = body;

    // Create diagnosis report
    const report = await db.diagnosisReport.create({
      data: {
        diseaseCode,
        diseaseName,
        patientAge,
        patientGender,
        severity: severity || "MODERATE",
        outcome: outcome || "ONGOING",
        district,
        region,
        facilityId: facilityId || user.facilityId,
        reportedById: session.user.id,
        reportedAt: new Date(),
      },
    });

    // Trigger epidemic analysis (async)
    analyzeForEpidemic(diseaseName, district, region).catch(console.error);

    return NextResponse.json({
      success: true,
      report: { id: report.id },
      message: "Diagnosis submitted successfully",
    });
  } catch (error) {
    console.error("[Diagnoses] Error submitting diagnosis:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit diagnosis" },
      { status: 500 }
    );
  }
}

// Analyze diagnosis data for potential epidemic/pandemic
async function analyzeForEpidemic(diseaseName: string, district: string, region: string) {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Count cases in the last 30 days for this disease in the region
    const totalCases = await db.diagnosisReport.count({
      where: {
        diseaseName,
        region,
        reportedAt: { gte: thirtyDaysAgo },
      },
    });

    // Count cases in the last 7 days
    const recentCases = await db.diagnosisReport.count({
      where: {
        diseaseName,
        region,
        reportedAt: { gte: sevenDaysAgo },
      },
    });

    // Calculate trend (is it increasing?)
    const previousWeekCases = totalCases - recentCases;
    const growthRate = previousWeekCases > 0 ? (recentCases / previousWeekCases) : recentCases;

    // Determine alert level
    let alertLevel: "WATCH" | "EPIDEMIC" | "PANDEMIC" | null = null;
    let severity: "INFO" | "WARNING" | "CRITICAL" = "INFO";

    if (recentCases >= 100 && growthRate >= 2) {
      alertLevel = "PANDEMIC";
      severity = "CRITICAL";
    } else if (recentCases >= 50 && growthRate >= 1.5) {
      alertLevel = "EPIDEMIC";
      severity = "WARNING";
    } else if (recentCases >= 20 && growthRate >= 1.2) {
      alertLevel = "WATCH";
      severity = "INFO";
    }

    if (alertLevel) {
      // Check if similar alert already exists
      const existingAlert = await db.alert.findFirst({
        where: {
          type: alertLevel,
          targetRegion: region,
          isActive: true,
          createdAt: { gte: sevenDaysAgo },
        },
      });

      if (!existingAlert) {
        // Create AI-generated alert recommendation for ministry review
        await db.alert.create({
          data: {
            title: `${alertLevel}: ${diseaseName} in ${region}`,
            message: `AI Analysis: ${recentCases} cases of ${diseaseName} reported in ${region} over the past 7 days. Growth rate: ${(growthRate * 100).toFixed(0)}%. Recommend ministry review.`,
            type: alertLevel,
            severity,
            targetRegion: region,
            isActive: alertLevel === "WATCH" ? false : true, // Watch alerts need ministry approval
            recommendations: generateRecommendations(diseaseName, alertLevel),
            metadata: {
              diseaseName,
              totalCases,
              recentCases,
              growthRate,
              analysisDate: new Date().toISOString(),
              requiresApproval: alertLevel === "WATCH",
            },
          },
        });

        console.log(`[AI Analysis] Created ${alertLevel} alert for ${diseaseName} in ${region}`);
      }
    }
  } catch (error) {
    console.error("[AI Analysis] Error analyzing epidemic data:", error);
  }
}

function generateRecommendations(diseaseName: string, alertLevel: string): string[] {
  const baseRecommendations = [
    "Seek medical attention if you experience symptoms",
    "Practice good hygiene and wash hands frequently",
    "Follow guidelines from local health authorities",
  ];

  const diseaseSpecific: Record<string, string[]> = {
    "Cholera": [
      "Drink only boiled or treated water",
      "Avoid raw or undercooked seafood",
      "Use proper sanitation facilities",
    ],
    "Malaria": [
      "Sleep under insecticide-treated mosquito nets",
      "Use mosquito repellent",
      "Eliminate stagnant water around your home",
    ],
    "COVID-19": [
      "Wear masks in crowded places",
      "Maintain social distancing",
      "Get vaccinated if eligible",
    ],
    "Typhoid": [
      "Drink only safe, treated water",
      "Avoid street food",
      "Ensure food is thoroughly cooked",
    ],
  };

  const specific = diseaseSpecific[diseaseName] || [];
  
  if (alertLevel === "PANDEMIC") {
    return [
      "URGENT: Avoid non-essential travel",
      "Stay home if you feel unwell",
      ...specific,
      ...baseRecommendations,
    ];
  }

  return [...specific, ...baseRecommendations];
}
