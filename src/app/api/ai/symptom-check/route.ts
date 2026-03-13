import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// Symptom-condition mapping for basic analysis
const SYMPTOM_CONDITIONS: Record<string, { conditions: string[]; urgency: string }> = {
  "fever": { conditions: ["Malaria", "Typhoid", "Flu", "COVID-19"], urgency: "MODERATE" },
  "headache": { conditions: ["Tension Headache", "Migraine", "Malaria", "Dehydration"], urgency: "LOW" },
  "cough": { conditions: ["Common Cold", "Flu", "Bronchitis", "Pneumonia"], urgency: "LOW" },
  "chest pain": { conditions: ["Heart Attack", "Angina", "Acid Reflux", "Muscle Strain"], urgency: "HIGH" },
  "difficulty breathing": { conditions: ["Asthma", "Pneumonia", "COVID-19", "Heart Failure"], urgency: "EMERGENCY" },
  "diarrhea": { conditions: ["Food Poisoning", "Cholera", "Gastroenteritis", "IBS"], urgency: "MODERATE" },
  "vomiting": { conditions: ["Food Poisoning", "Gastroenteritis", "Pregnancy", "Migraine"], urgency: "MODERATE" },
  "abdominal pain": { conditions: ["Appendicitis", "Gastritis", "Food Poisoning", "Ulcer"], urgency: "MODERATE" },
  "rash": { conditions: ["Allergic Reaction", "Measles", "Chickenpox", "Eczema"], urgency: "LOW" },
  "fatigue": { conditions: ["Anemia", "Diabetes", "Thyroid Issues", "Depression"], urgency: "LOW" },
  "joint pain": { conditions: ["Arthritis", "Rheumatism", "Gout", "Injury"], urgency: "LOW" },
  "sore throat": { conditions: ["Strep Throat", "Tonsillitis", "Common Cold", "Flu"], urgency: "LOW" },
  "body aches": { conditions: ["Flu", "Malaria", "COVID-19", "Fibromyalgia"], urgency: "LOW" },
  "high blood pressure": { conditions: ["Hypertension", "Stress", "Kidney Disease"], urgency: "HIGH" },
  "dizziness": { conditions: ["Low Blood Pressure", "Anemia", "Dehydration", "Inner Ear Issue"], urgency: "MODERATE" },
  "bleeding": { conditions: ["Injury", "Internal Bleeding", "Ulcer"], urgency: "HIGH" },
  "unconscious": { conditions: ["Stroke", "Heart Attack", "Seizure", "Diabetic Emergency"], urgency: "EMERGENCY" },
  "seizure": { conditions: ["Epilepsy", "Fever", "Brain Injury"], urgency: "EMERGENCY" },
};

const CONDITION_DETAILS: Record<string, { description: string; firstAid: string[] }> = {
  "Malaria": {
    description: "A mosquito-borne disease common in Ghana causing fever, chills, and flu-like symptoms.",
    firstAid: ["Rest and stay hydrated", "Take paracetamol for fever", "Seek medical testing immediately"]
  },
  "Typhoid": {
    description: "A bacterial infection spread through contaminated food or water.",
    firstAid: ["Stay hydrated with clean water", "Rest completely", "Seek medical attention for antibiotics"]
  },
  "Cholera": {
    description: "A severe diarrheal disease that can cause rapid dehydration.",
    firstAid: ["Drink ORS (Oral Rehydration Solution) immediately", "Seek emergency medical care", "Avoid solid food until vomiting stops"]
  },
  "Heart Attack": {
    description: "A medical emergency where blood flow to the heart is blocked.",
    firstAid: ["Call emergency services immediately", "Chew aspirin if available", "Rest in a comfortable position"]
  },
  "Stroke": {
    description: "A medical emergency where blood supply to the brain is interrupted.",
    firstAid: ["Call emergency services immediately", "Note the time symptoms started", "Keep the person calm and still"]
  },
};

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const body = await request.json();
    const { symptoms, duration, severity } = body;

    if (!symptoms) {
      return NextResponse.json(
        { error: "Please describe your symptoms" },
        { status: 400 }
      );
    }

    const symptomsLower = symptoms.toLowerCase();
    const matchedConditions = new Map<string, { count: number; urgency: string }>();
    let highestUrgency = "LOW";

    // Analyze symptoms
    for (const [symptom, data] of Object.entries(SYMPTOM_CONDITIONS)) {
      if (symptomsLower.includes(symptom)) {
        for (const condition of data.conditions) {
          const existing = matchedConditions.get(condition);
          if (existing) {
            existing.count++;
          } else {
            matchedConditions.set(condition, { count: 1, urgency: data.urgency });
          }
        }
        // Update highest urgency
        const urgencyOrder = ["LOW", "MODERATE", "HIGH", "EMERGENCY"];
        if (urgencyOrder.indexOf(data.urgency) > urgencyOrder.indexOf(highestUrgency)) {
          highestUrgency = data.urgency;
        }
      }
    }

    // Adjust urgency based on severity input
    if (severity === "severe" && highestUrgency === "LOW") {
      highestUrgency = "MODERATE";
    } else if (severity === "severe" && highestUrgency === "MODERATE") {
      highestUrgency = "HIGH";
    }

    // Sort conditions by match count
    const sortedConditions = Array.from(matchedConditions.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 4)
      .map(([name, data]) => ({
        name,
        probability: data.count >= 3 ? "HIGH" : data.count >= 2 ? "MEDIUM" : "LOW",
        description: CONDITION_DETAILS[name]?.description || `A condition that may cause your symptoms. Please consult a healthcare provider for proper diagnosis.`,
      }));

    // If no conditions matched, provide generic response
    if (sortedConditions.length === 0) {
      sortedConditions.push({
        name: "Unspecified Condition",
        probability: "LOW" as const,
        description: "Your symptoms don't match common patterns. Please consult a healthcare provider for proper evaluation.",
      });
    }

    // Generate recommendations
    const recommendations = [
      "Consult a healthcare professional for proper diagnosis",
      "Keep track of your symptoms and any changes",
      "Stay hydrated and get adequate rest",
    ];

    if (highestUrgency === "HIGH" || highestUrgency === "EMERGENCY") {
      recommendations.unshift("Seek immediate medical attention");
    }

    // Gather first aid tips
    const firstAid: string[] = [];
    for (const condition of sortedConditions.slice(0, 2)) {
      const details = CONDITION_DETAILS[condition.name];
      if (details?.firstAid) {
        firstAid.push(...details.firstAid);
      }
    }

    // Get recommended facility types
    type FacilityType = "HOSPITAL" | "CLINIC" | "PHARMACY" | "DIAGNOSTIC_CENTRE" | "MATERNITY_HOME" | "CHPS_COMPOUND" | "POLYCLINIC" | "HEALTH_CENTRE";
    
    const suggestedFacilityTypes: FacilityType[] = highestUrgency === "EMERGENCY" 
      ? ["HOSPITAL"] 
      : highestUrgency === "HIGH"
      ? ["HOSPITAL", "POLYCLINIC"]
      : ["CLINIC", "HEALTH_CENTRE", "POLYCLINIC"];

    // Get nearby facilities if user is logged in
    let recommendedFacilities: unknown[] = [];
    if (session?.user) {
      try {
        recommendedFacilities = await db.facility.findMany({
          where: {
            status: "APPROVED",
            type: { in: suggestedFacilityTypes },
            ...(highestUrgency === "EMERGENCY" ? { emergencyCapable: true } : {}),
          },
          select: {
            id: true,
            name: true,
            slug: true,
            type: true,
            phone: true,
            emergencyCapable: true,
            latitude: true,
            longitude: true,
          },
          take: 5,
        });

        // Add mock distance (in real app, calculate from user location)
        recommendedFacilities = recommendedFacilities.map((f: unknown, i: number) => ({
          ...(f as Record<string, unknown>),
          distance: 1.5 + i * 2.3,
        }));
      } catch (e) {
        console.error("Error fetching facilities:", e);
      }
    }

    const analysis = {
      possibleConditions: sortedConditions,
      urgencyLevel: highestUrgency,
      recommendations,
      firstAid: Array.from(new Set(firstAid)).slice(0, 5),
      suggestedFacilityTypes,
      disclaimer: "This is not a medical diagnosis. Always consult a qualified healthcare provider for proper medical advice.",
    };

    // Log the symptom check (anonymized)
    if (session?.user) {
      await db.auditLog.create({
        data: {
          userId: session.user.id,
          action: "SYMPTOM_CHECK_PERFORMED",
          entityType: "SymptomCheck",
          entityId: "anonymous",
          details: {
            urgencyLevel: highestUrgency,
            conditionsCount: sortedConditions.length,
          },
        },
      });
    }

    return NextResponse.json({
      analysis,
      recommendedFacilities,
    });
  } catch (error) {
    console.error("Error in symptom check:", error);
    return NextResponse.json(
      { error: "Failed to analyze symptoms" },
      { status: 500 }
    );
  }
}
