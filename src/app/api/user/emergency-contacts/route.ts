import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in" },
        { status: 401 }
      );
    }

    const contacts = await db.emergencyContact.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        name: true,
        phone: true,
        relationship: true,
      },
    });

    return NextResponse.json({ contacts });
  } catch (error) {
    console.error("Error fetching emergency contacts:", error);
    return NextResponse.json(
      { error: "Failed to fetch emergency contacts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, phone, relationship } = body;

    if (!name || !phone || !relationship) {
      return NextResponse.json(
        { error: "Name, phone, and relationship are required" },
        { status: 400 }
      );
    }

    if (!session.user.id) {
      return NextResponse.json(
        { error: "User ID not found" },
        { status: 401 }
      );
    }

    // Check if user already has 5 emergency contacts
    const existingCount = await db.emergencyContact.count({
      where: { userId: session.user.id },
    });

    if (existingCount >= 5) {
      return NextResponse.json(
        { error: "Maximum of 5 emergency contacts allowed" },
        { status: 400 }
      );
    }

    const contact = await db.emergencyContact.create({
      data: {
        userId: session.user.id,
        name,
        phone,
        relationship,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        relationship: true,
      },
    });

    return NextResponse.json({
      message: "Emergency contact added",
      contact,
    }, { status: 201 });
  } catch (error) {
    console.error("Error adding emergency contact:", error);
    return NextResponse.json(
      { error: "Failed to add emergency contact" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const contactId = searchParams.get("id");

    if (!contactId) {
      return NextResponse.json(
        { error: "Contact ID is required" },
        { status: 400 }
      );
    }

    // Verify the contact belongs to the user
    const contact = await db.emergencyContact.findFirst({
      where: {
        id: contactId,
        userId: session.user.id,
      },
    });

    if (!contact) {
      return NextResponse.json(
        { error: "Contact not found" },
        { status: 404 }
      );
    }

    await db.emergencyContact.delete({
      where: { id: contactId },
    });

    return NextResponse.json({
      message: "Emergency contact removed",
    });
  } catch (error) {
    console.error("Error removing emergency contact:", error);
    return NextResponse.json(
      { error: "Failed to remove emergency contact" },
      { status: 500 }
    );
  }
}
