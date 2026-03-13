"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Loader2 } from "lucide-react";

interface FavoriteButtonProps {
  facilityId: string;
  variant?: "icon" | "button";
  className?: string;
}

export default function FavoriteButton({ facilityId, variant = "button", className }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkFavoriteStatus();
  }, [facilityId]);

  const checkFavoriteStatus = async () => {
    try {
      const response = await fetch("/api/user/favorites");
      if (response.ok) {
        const data = await response.json();
        const isFav = data.favorites.some((f: { id: string }) => f.id === facilityId);
        setIsFavorite(isFav);
      }
    } catch (error) {
      console.error("Error checking favorite status:", error);
    } finally {
      setIsChecking(false);
    }
  };

  const toggleFavorite = async () => {
    setIsLoading(true);
    try {
      if (isFavorite) {
        const response = await fetch(`/api/user/favorites?facilityId=${facilityId}`, {
          method: "DELETE",
        });
        if (response.ok) {
          setIsFavorite(false);
        } else {
          const data = await response.json();
          if (response.status === 401) {
            alert("Please log in to save favorites");
          } else {
            console.error(data.error);
          }
        }
      } else {
        const response = await fetch("/api/user/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ facilityId }),
        });
        if (response.ok) {
          setIsFavorite(true);
        } else {
          const data = await response.json();
          if (response.status === 401) {
            alert("Please log in to save favorites");
          } else {
            console.error(data.error);
          }
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking) {
    return variant === "icon" ? (
      <button className={`p-2 rounded-full bg-white/80 ${className}`} disabled>
        <Heart className="h-5 w-5 text-gray-300" />
      </button>
    ) : (
      <Button variant="outline" size="sm" disabled className={className}>
        <Heart className="h-4 w-4 mr-2" />
        Save
      </Button>
    );
  }

  if (variant === "icon") {
    return (
      <button
        onClick={toggleFavorite}
        disabled={isLoading}
        className={`p-2 rounded-full bg-white/80 hover:bg-white transition-colors ${className}`}
        title={isFavorite ? "Remove from favorites" : "Add to favorites"}
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
        ) : (
          <Heart
            className={`h-5 w-5 transition-colors ${
              isFavorite ? "fill-red-500 text-red-500" : "text-gray-500 hover:text-red-500"
            }`}
          />
        )}
      </button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleFavorite}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Heart
          className={`h-4 w-4 mr-2 ${isFavorite ? "fill-red-500 text-red-500" : ""}`}
        />
      )}
      {isFavorite ? "Saved" : "Save"}
    </Button>
  );
}
