"use client";

import { useState } from "react";
import ReviewForm from "./ReviewForm";
import ReviewList from "./ReviewList";

interface FacilityReviewsProps {
  facilityId: string;
  facilityName: string;
}

export default function FacilityReviews({ facilityId, facilityName }: FacilityReviewsProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleReviewSubmitted = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <ReviewList facilityId={facilityId} refreshTrigger={refreshTrigger} />
      <ReviewForm 
        facilityId={facilityId} 
        facilityName={facilityName}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </div>
  );
}
