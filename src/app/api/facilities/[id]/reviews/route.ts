import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      db.review.findMany({
        where: {
          facilityId: params.id,
          status: "ACTIVE",
        },
        include: {
          citizen: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      db.review.count({
        where: {
          facilityId: params.id,
          status: "ACTIVE",
        },
      }),
    ]);

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in to submit a review" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { rating, text } = body;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Check if facility exists
    const facility = await db.facility.findUnique({
      where: { id: params.id },
    });

    if (!facility) {
      return NextResponse.json(
        { error: "Facility not found" },
        { status: 404 }
      );
    }

    if (!session.user.id) {
      return NextResponse.json(
        { error: "User ID not found" },
        { status: 401 }
      );
    }

    // Check if user already reviewed this facility
    const existingReview = await db.review.findFirst({
      where: {
        facilityId: params.id,
        citizenId: session.user.id,
      },
    });

    if (existingReview) {
      // Update existing review
      const updatedReview = await db.review.update({
        where: { id: existingReview.id },
        data: {
          rating,
          text: text || null,
          status: "ACTIVE",
          updatedAt: new Date(),
        },
        include: {
          citizen: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Update facility average rating
      await updateFacilityRating(params.id);

      return NextResponse.json({
        message: "Review updated successfully",
        review: updatedReview,
      });
    }

    // Create new review
    const review = await db.review.create({
      data: {
        facilityId: params.id,
        citizenId: session.user.id,
        rating,
        text: text || null,
        status: "ACTIVE",
      },
      include: {
        citizen: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Update facility average rating
    await updateFacilityRating(params.id);

    return NextResponse.json({
      message: "Review submitted successfully",
      review,
    }, { status: 201 });
  } catch (error) {
    console.error("Error submitting review:", error);
    return NextResponse.json(
      { error: "Failed to submit review" },
      { status: 500 }
    );
  }
}

async function updateFacilityRating(facilityId: string) {
  const reviews = await db.review.findMany({
    where: {
      facilityId,
      status: "ACTIVE",
    },
    select: {
      rating: true,
    },
  });

  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / totalReviews
    : 0;

  await db.facility.update({
    where: { id: facilityId },
    data: {
      averageRating,
      totalReviews,
    },
  });
}
