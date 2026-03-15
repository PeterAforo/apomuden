"use client";

import { Star, Award, Shield, Building2, Home } from "lucide-react";

interface TierBadgeProps {
  tier: string | null;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const TIER_CONFIG: Record<string, {
  stars: number;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ReactNode;
  description: string;
}> = {
  FIVE_STAR: {
    stars: 5,
    label: "Tier 5",
    color: "text-amber-600",
    bgColor: "bg-gradient-to-r from-amber-50 to-yellow-50",
    borderColor: "border-amber-200",
    icon: <Award className="w-4 h-4" />,
    description: "Premier Teaching Hospital",
  },
  FOUR_STAR: {
    stars: 4,
    label: "Tier 4",
    color: "text-purple-600",
    bgColor: "bg-gradient-to-r from-purple-50 to-indigo-50",
    borderColor: "border-purple-200",
    icon: <Shield className="w-4 h-4" />,
    description: "Regional Referral Hospital",
  },
  THREE_STAR: {
    stars: 3,
    label: "Tier 3",
    color: "text-blue-600",
    bgColor: "bg-gradient-to-r from-blue-50 to-cyan-50",
    borderColor: "border-blue-200",
    icon: <Building2 className="w-4 h-4" />,
    description: "District Hospital",
  },
  TWO_STAR: {
    stars: 2,
    label: "Tier 2",
    color: "text-emerald-600",
    bgColor: "bg-gradient-to-r from-emerald-50 to-teal-50",
    borderColor: "border-emerald-200",
    icon: <Home className="w-4 h-4" />,
    description: "Health Centre",
  },
  ONE_STAR: {
    stars: 1,
    label: "Tier 1",
    color: "text-gray-600",
    bgColor: "bg-gradient-to-r from-gray-50 to-slate-50",
    borderColor: "border-gray-200",
    icon: <Home className="w-4 h-4" />,
    description: "CHPS Compound",
  },
};

export default function TierBadge({ tier, size = "md", showLabel = true }: TierBadgeProps) {
  if (!tier) return null;

  const config = TIER_CONFIG[tier];
  if (!config) return null;

  const sizeClasses = {
    sm: "px-2 py-1 text-xs gap-1",
    md: "px-3 py-1.5 text-sm gap-1.5",
    lg: "px-4 py-2 text-base gap-2",
  };

  const starSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <div
      className={`inline-flex items-center ${sizeClasses[size]} ${config.bgColor} ${config.borderColor} border rounded-full font-medium ${config.color}`}
    >
      {config.icon}
      <div className="flex items-center gap-0.5">
        {Array.from({ length: config.stars }).map((_, i) => (
          <Star
            key={i}
            className={`${starSizes[size]} fill-current`}
          />
        ))}
      </div>
      {showLabel && <span>{config.label}</span>}
    </div>
  );
}

export function TierCard({ tier }: { tier: string | null }) {
  if (!tier) return null;

  const config = TIER_CONFIG[tier];
  if (!config) return null;

  return (
    <div className={`${config.bgColor} ${config.borderColor} border rounded-xl p-4`}>
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-full ${config.bgColor} border-2 ${config.borderColor} flex items-center justify-center`}>
          <div className={config.color}>
            {config.icon}
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className={`font-semibold ${config.color}`}>{config.label}</span>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: config.stars }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${config.color} fill-current`}
                />
              ))}
            </div>
          </div>
          <p className="text-sm text-gray-600">{config.description}</p>
        </div>
      </div>
    </div>
  );
}
