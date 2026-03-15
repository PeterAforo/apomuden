"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, ZoomIn, ImageIcon } from "lucide-react";

interface FacilityImageGalleryProps {
  images: string[];
  facilityName: string;
}

export default function FacilityImageGallery({ images, facilityName }: FacilityImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [imageError, setImageError] = useState<Record<number, boolean>>({});

  const hasImages = images && images.length > 0;
  const validImages = hasImages ? images.filter((_, i) => !imageError[i]) : [];

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % validImages.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
  };

  const handleImageError = (index: number) => {
    setImageError((prev) => ({ ...prev, [index]: true }));
  };

  if (!hasImages || validImages.length === 0) {
    return (
      <div className="relative w-full h-64 md:h-80 bg-gradient-to-br from-emerald-100 to-teal-50 rounded-xl flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-emerald-200 rounded-full flex items-center justify-center mx-auto mb-3">
            <ImageIcon className="w-8 h-8 text-emerald-600" />
          </div>
          <p className="text-emerald-700 font-medium">{facilityName}</p>
          <p className="text-emerald-600 text-sm">No images available</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Main Gallery */}
      <div className="relative group">
        {/* Main Image */}
        <div 
          className="relative w-full h-64 md:h-96 rounded-xl overflow-hidden cursor-pointer"
          onClick={() => setIsLightboxOpen(true)}
        >
          <Image
            src={validImages[currentIndex]}
            alt={`${facilityName} - Image ${currentIndex + 1}`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => handleImageError(currentIndex)}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          {/* Zoom indicator */}
          <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
            <ZoomIn className="w-4 h-4 text-gray-700" />
            <span className="text-sm text-gray-700">Click to enlarge</span>
          </div>
        </div>

        {/* Navigation Arrows */}
        {validImages.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:scale-110"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:scale-110"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </>
        )}

        {/* Dots Indicator */}
        {validImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {validImages.map((_, index) => (
              <button
                key={index}
                onClick={(e) => { e.stopPropagation(); setCurrentIndex(index); }}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  index === currentIndex 
                    ? "bg-white w-6" 
                    : "bg-white/50 hover:bg-white/75"
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail Strip */}
      {validImages.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300">
          {validImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`relative flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden transition-all ${
                index === currentIndex 
                  ? "ring-2 ring-emerald-500 ring-offset-2" 
                  : "opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={image}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                onError={() => handleImageError(index)}
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {isLightboxOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
            aria-label="Close lightbox"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          <div className="relative w-full h-full max-w-5xl max-h-[85vh] m-4" onClick={(e) => e.stopPropagation()}>
            <Image
              src={validImages[currentIndex]}
              alt={`${facilityName} - Image ${currentIndex + 1}`}
              fill
              className="object-contain"
            />
          </div>

          {validImages.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-8 h-8 text-white" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                aria-label="Next image"
              >
                <ChevronRight className="w-8 h-8 text-white" />
              </button>
            </>
          )}

          {/* Image counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
            <span className="text-white text-sm">
              {currentIndex + 1} / {validImages.length}
            </span>
          </div>
        </div>
      )}
    </>
  );
}
