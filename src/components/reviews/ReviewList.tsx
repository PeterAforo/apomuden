"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, ChevronLeft, ChevronRight, Loader2, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Review {
  id: string;
  rating: number;
  text: string | null;
  facilityResponse: string | null;
  facilityRespondedAt: string | null;
  createdAt: string;
  citizen: {
    id: string;
    name: string;
  };
}

interface ReviewListProps {
  facilityId: string;
  refreshTrigger?: number;
}

export default function ReviewList({ facilityId, refreshTrigger }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchReviews();
  }, [facilityId, page, refreshTrigger]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/facilities/${facilityId}/reviews?page=${page}&limit=5`);
      const data = await response.json();
      
      if (response.ok) {
        setReviews(data.reviews);
        setTotalPages(data.pagination.totalPages);
        setTotal(data.pagination.total);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading && reviews.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
        </CardContent>
      </Card>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No reviews yet</p>
            <p className="text-sm">Be the first to share your experience!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg">Reviews</CardTitle>
          <p className="text-sm text-gray-500">{total} review{total !== 1 ? "s" : ""}</p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border-b pb-4 last:border-0 last:pb-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium text-gray-900">{review.citizen.name}</p>
                  <p className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                  </p>
                </div>
                {renderStars(review.rating)}
              </div>
              
              {review.text && (
                <p className="text-gray-600 text-sm mt-2">{review.text}</p>
              )}

              {/* Facility Response */}
              {review.facilityResponse && (
                <div className="mt-3 ml-4 p-3 bg-emerald-50 rounded-lg border-l-4 border-emerald-500">
                  <p className="text-xs font-medium text-emerald-700 mb-1">Facility Response</p>
                  <p className="text-sm text-gray-700">{review.facilityResponse}</p>
                  {review.facilityRespondedAt && (
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDistanceToNow(new Date(review.facilityRespondedAt), { addSuffix: true })}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <span className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
