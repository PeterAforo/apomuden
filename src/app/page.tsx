"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, useInView, PanInfo } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  MapPin,
  Phone,
  AlertTriangle,
  Building2,
  Shield,
  Clock,
  Star,
  Bell,
  Ambulance,
  Navigation,
  Newspaper,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
};

interface Facility {
  id: string;
  name: string;
  slug: string;
  type: string;
  tier: string | null;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  nhisAccepted: boolean;
  emergencyCapable: boolean;
  ambulanceAvailable: boolean;
  averageRating: number;
  totalReviews: number;
  region: { name: string };
  distance?: number;
  imageUrl?: string;
}

interface HealthNews {
  id: string;
  title: string;
  summary: string;
  category: string;
  date: string;
  image: string;
  isLocal: boolean;
}

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=1920&q=80", // African healthcare
  "https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=1920&q=80", // African medical team
  "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=1920&q=80", // African doctor
  "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=1920&q=80", // Healthcare professional
];

const MOCK_NEWS: HealthNews[] = [
  {
    id: "1",
    title: "Ghana Health Service Launches New Vaccination Campaign",
    summary: "A nationwide vaccination drive targeting children under 5 begins next week across all 16 regions.",
    category: "Vaccination",
    date: "2024-01-15",
    image: "https://images.unsplash.com/photo-1609220136736-443140cffec6?w=400&q=80", // African child vaccination
    isLocal: false,
  },
  {
    id: "2",
    title: "Malaria Prevention Tips for the Rainy Season",
    summary: "Health experts advise on protective measures as malaria cases typically rise during the wet season.",
    category: "Prevention",
    date: "2024-01-14",
    image: "https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=400&q=80", // Mosquito net prevention
    isLocal: true,
  },
  {
    id: "3",
    title: "New Mental Health Hotline Launched",
    summary: "Ministry of Health introduces 24/7 mental health support line for all Ghanaians.",
    category: "Mental Health",
    date: "2024-01-13",
    image: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=400&q=80", // African woman healthcare
    isLocal: false,
  },
  {
    id: "4",
    title: "COVID-19 Booster Shots Now Available",
    summary: "Updated booster vaccines are now available at all regional hospitals and select health centers.",
    category: "COVID-19",
    date: "2024-01-12",
    image: "https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?w=400&q=80", // African vaccination
    isLocal: false,
  },
];

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);
  const [nearbyFacilities, setNearbyFacilities] = useState<Facility[]>([]);
  const [featuredFacilities, setFeaturedFacilities] = useState<Facility[]>([]);
  const [loadingNearby, setLoadingNearby] = useState(true);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Swipe gesture handlers for hero carousel
  const handleDragEnd = useCallback(
    (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const swipeThreshold = 50;
      const swipeVelocity = 500;
      
      if (info.offset.x < -swipeThreshold || info.velocity.x < -swipeVelocity) {
        // Swiped left - go to next slide
        setCurrentSlide((prev) => (prev + 1) % HERO_IMAGES.length);
      } else if (info.offset.x > swipeThreshold || info.velocity.x > swipeVelocity) {
        // Swiped right - go to previous slide
        setCurrentSlide((prev) => (prev - 1 + HERO_IMAGES.length) % HERO_IMAGES.length);
      }
      setIsDragging(false);
    },
    []
  );

  // Auto-slide hero images
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          // Default to Accra if location denied
          setUserLocation({ lat: 5.6037, lng: -0.187 });
        }
      );
    }
  }, []);

  // Fetch facilities
  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const res = await fetch("/api/facilities?pageSize=50");
        const data = await res.json();
        if (data.success) {
          const facilities = data.data.items;
          
          // Set featured (top-rated) - show 12 facilities
          const featured = [...facilities]
            .sort((a: Facility, b: Facility) => b.averageRating - a.averageRating)
            .slice(0, 12);
          setFeaturedFacilities(featured);

          // Calculate distances and set nearby
          if (userLocation) {
            const withDistance = facilities.map((f: Facility) => ({
              ...f,
              distance: calculateDistance(userLocation.lat, userLocation.lng, f.latitude, f.longitude),
            }));
            const nearby = withDistance
              .sort((a: Facility, b: Facility) => (a.distance || 0) - (b.distance || 0))
              .slice(0, 4);
            setNearbyFacilities(nearby);
          }
        }
      } catch (error) {
        console.error("Error fetching facilities:", error);
      } finally {
        setLoadingNearby(false);
      }
    };

    fetchFacilities();
  }, [userLocation]);

  const enableNotifications = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setNotificationsEnabled(true);
        setShowNotificationModal(false);
        new Notification("OneHealthGH Alerts", {
          body: "You will now receive health news and alerts for your area.",
          icon: "/icon.png",
        });
      }
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header - Using shared Navbar component */}
      <Navbar 
        onNotificationClick={() => setShowNotificationModal(true)}
        notificationsEnabled={notificationsEnabled}
      />

      {/* Hero Section with Sliding Background */}
      <motion.section 
        className="relative min-h-[500px] h-[100svh] max-h-[700px] md:min-h-[600px] overflow-hidden touch-pan-y"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
      >
        {/* Background Images */}
        {HERO_IMAGES.map((img, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${img})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
          </div>
        ))}

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {HERO_IMAGES.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`min-w-[44px] min-h-[44px] flex items-center justify-center`}
              aria-label={`Go to slide ${index + 1}`}
            >
              <span className={`block rounded-full transition-all ${
                index === currentSlide ? "bg-white w-8 h-3" : "bg-white/50 w-3 h-3"
              }`} />
            </button>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + HERO_IMAGES.length) % HERO_IMAGES.length)}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 hover:bg-white/30 rounded-full z-10 min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-6 w-6 text-white" />
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % HERO_IMAGES.length)}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 hover:bg-white/30 rounded-full z-10 min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Next slide"
        >
          <ChevronRight className="h-6 w-6 text-white" />
        </button>

        {/* Hero Content */}
        <div className="relative z-10 h-full flex items-center">
          <div className="container">
            <motion.div 
              className="max-w-3xl mx-auto text-center text-white"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.h1 
                className="text-4xl md:text-6xl font-bold tracking-tight mb-6"
                variants={fadeInUp}
                transition={{ duration: 0.6 }}
              >
                Your Health, <span className="text-emerald-400">Closer</span>
              </motion.h1>
              <motion.p 
                className="text-lg md:text-xl text-white/90 mb-8"
                variants={fadeInUp}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Ghana's National Digital Health Platform. Find healthcare facilities,
                compare services and prices, and access emergency services — all in one place.
              </motion.p>

              {/* Search Bar */}
              <motion.div 
                className="relative max-w-2xl mx-auto mb-8"
                variants={fadeInUp}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center bg-white rounded-lg shadow-lg p-2 gap-2 sm:gap-0">
                  <div className="flex-1 flex items-center px-4 py-2 sm:py-0">
                    <Search className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                    <input
                      type="text"
                      placeholder="Search hospitals, clinics..."
                      className="w-full bg-transparent border-none outline-none text-base sm:text-sm text-gray-900 min-h-[44px]"
                    />
                  </div>
                  <div className="flex items-center px-4 py-2 sm:py-0 border-t sm:border-t-0 sm:border-l">
                    <MapPin className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                    <input
                      type="text"
                      placeholder="Location"
                      className="w-full sm:w-32 bg-transparent border-none outline-none text-base sm:text-sm text-gray-900 min-h-[44px]"
                    />
                  </div>
                  <Button className="sm:ml-2 bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto min-h-[44px]">Search</Button>
                </div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div 
                className="grid grid-cols-2 sm:flex sm:flex-wrap justify-center gap-3 sm:gap-4"
                variants={fadeInUp}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <Link href="/facilities?type=HOSPITAL">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="outline" size="lg" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                      <Building2 className="h-4 w-4 mr-2" />
                      Hospitals
                    </Button>
                  </motion.div>
                </Link>
                <Link href="/facilities?type=PHARMACY">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="outline" size="lg" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                      <Shield className="h-4 w-4 mr-2" />
                      Pharmacies
                    </Button>
                  </motion.div>
                </Link>
                <Link href="/facilities?nhis=true">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="outline" size="lg" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                      <Star className="h-4 w-4 mr-2" />
                      NHIS Accepted
                    </Button>
                  </motion.div>
                </Link>
                <motion.button
                  onClick={() => setShowEmergencyModal(true)}
                  className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  animate={{ 
                    boxShadow: ["0 0 0 0 rgba(220, 38, 38, 0.4)", "0 0 0 10px rgba(220, 38, 38, 0)", "0 0 0 0 rgba(220, 38, 38, 0)"]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Ambulance className="h-4 w-4 mr-2" />
                  Request Ambulance
                </motion.button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Health Alerts Section */}
      <section className="py-16 bg-amber-50/50">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
                Health Alerts
              </h2>
              <p className="text-muted-foreground">Stay informed about health advisories in Ghana</p>
            </div>
            <Link href="/alerts">
              <Button variant="outline">View All →</Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                id: "1",
                title: "Malaria Cases Rising in Northern Region",
                type: "OUTBREAK",
                severity: "HIGH",
                region: "Northern",
                date: "2024-01-15",
              },
              {
                id: "2",
                title: "COVID-19 Booster Vaccination Campaign",
                type: "ADVISORY",
                severity: "MEDIUM",
                region: null,
                date: "2024-01-14",
              },
              {
                id: "3",
                title: "Cholera Prevention Advisory",
                type: "WARNING",
                severity: "HIGH",
                region: "Greater Accra",
                date: "2024-01-12",
              },
              {
                id: "4",
                title: "Mental Health Awareness Week",
                type: "INFO",
                severity: "LOW",
                region: null,
                date: "2024-01-10",
              },
            ].map((alert) => (
              <motion.div
                key={alert.id}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <Link href="/alerts">
                  <Card className={`h-full cursor-pointer hover:shadow-lg transition-shadow border-l-4 ${
                    alert.type === "OUTBREAK" ? "border-l-red-500" :
                    alert.type === "WARNING" ? "border-l-amber-500" :
                    alert.type === "ADVISORY" ? "border-l-blue-500" :
                    "border-l-green-500"
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                          alert.type === "OUTBREAK" ? "bg-red-100 text-red-700" :
                          alert.type === "WARNING" ? "bg-amber-100 text-amber-700" :
                          alert.type === "ADVISORY" ? "bg-blue-100 text-blue-700" :
                          "bg-green-100 text-green-700"
                        }`}>
                          {alert.type}
                        </span>
                        <span className={`w-2 h-2 rounded-full ${
                          alert.severity === "HIGH" ? "bg-red-500" :
                          alert.severity === "MEDIUM" ? "bg-amber-500" :
                          "bg-green-500"
                        }`}></span>
                      </div>
                      <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-2">
                        {alert.title}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        {alert.region && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {alert.region}
                          </span>
                        )}
                        <span>{alert.date.split('-').reverse().join('/')}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Facilities Near Me Section */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2">
                <Navigation className="h-6 w-6 text-emerald-600" />
                Healthcare Near You
              </h2>
              <p className="text-muted-foreground">
                {userLocation ? "Based on your current location" : "Enable location to see nearby facilities"}
              </p>
            </div>
            <Link href="/facilities">
              <Button variant="outline">View All →</Button>
            </Link>
          </div>

          {loadingNearby ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-lg p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          ) : nearbyFacilities.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {nearbyFacilities.map((facility) => (
                <Link key={facility.id} href={`/facilities/${facility.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 line-clamp-1">{facility.name}</h3>
                        {facility.distance && (
                          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full whitespace-nowrap">
                            {facility.distance.toFixed(1)} km
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mb-3">{facility.type.replace("_", " ")}</p>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{facility.address}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-sm font-medium">{facility.averageRating.toFixed(1)}</span>
                        </div>
                        {facility.nhisAccepted && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">NHIS</span>
                        )}
                        {facility.emergencyCapable && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">24/7</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg">
              <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Enable location to find facilities near you</p>
            </div>
          )}
        </div>
      </section>

      {/* Featured Facilities Section */}
      <section className="py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2">
                <Star className="h-6 w-6 text-amber-500" />
                Featured Hospitals
              </h2>
              <p className="text-muted-foreground">Top-rated healthcare facilities in Ghana</p>
            </div>
            <Link href="/facilities">
              <Button variant="outline">View All →</Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {featuredFacilities.map((facility) => (
              <Link key={facility.id} href={`/facilities/${facility.slug}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer overflow-hidden group">
                  <div className="h-40 relative overflow-hidden">
                    {facility.imageUrl ? (
                      <img 
                        src={facility.imageUrl} 
                        alt={facility.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
                        <Building2 className="h-12 w-12 text-white/80" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                      <span className="text-xs font-medium">{facility.averageRating.toFixed(1)}</span>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-900 line-clamp-1 mb-1">{facility.name}</h3>
                    <p className="text-sm text-gray-500 mb-2">{facility.region.name}</p>
                    <div className="flex flex-wrap gap-1">
                      {facility.tier && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                          {facility.tier.replace("_", " ")}
                        </span>
                      )}
                      {facility.emergencyCapable && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">Emergency</span>
                      )}
                      {facility.nhisAccepted && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">NHIS</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Health News Section */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2">
                <Newspaper className="h-6 w-6 text-blue-600" />
                Latest Health News
              </h2>
              <p className="text-muted-foreground">Stay informed about health updates in Ghana</p>
            </div>
            <Link href="/news">
              <Button variant="outline">All News →</Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {MOCK_NEWS.map((news) => (
              <Card key={news.id} className="h-full hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
                <div
                  className="aspect-video bg-cover bg-center"
                  style={{ backgroundImage: `url(${news.image})` }}
                  role="img"
                  aria-label={news.title}
                />
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{news.category}</span>
                    {news.isLocal && (
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> Local
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">{news.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">{news.summary}</p>
                  <p className="text-xs text-gray-500" suppressHydrationWarning>{new Date(news.date).toLocaleDateString('en-GB')}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Emergency Request Section */}
      <section className="py-16 bg-red-600 text-white">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Ambulance className="h-10 w-10" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Need Emergency Help?</h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Request an ambulance or emergency medical services from the nearest facility with just one click.
              Our network of emergency responders is available 24/7.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => setShowEmergencyModal(true)}
                className="inline-flex items-center px-8 py-4 bg-white text-red-600 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors"
              >
                <Ambulance className="h-6 w-6 mr-3" />
                Request Ambulance Now
              </button>
              <a
                href="tel:112"
                className="inline-flex items-center px-8 py-4 bg-red-700 hover:bg-red-800 rounded-lg font-bold text-lg transition-colors"
              >
                <Phone className="h-6 w-6 mr-3" />
                Call 112
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Healthcare at Your Fingertips</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              OneHealthGH connects you with Ghana's healthcare network, making it easier to find care, compare options, and stay informed.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 rounded-lg border bg-card">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Find Facilities</h3>
              <p className="text-sm text-muted-foreground">
                Locate hospitals, clinics, and pharmacies near you with real-time availability.
              </p>
            </div>

            <div className="text-center p-6 rounded-lg border bg-card">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Compare Prices</h3>
              <p className="text-sm text-muted-foreground">
                View and compare service prices across facilities. Check NHIS coverage instantly.
              </p>
            </div>

            <div className="text-center p-6 rounded-lg border bg-card">
              <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <Phone className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="font-semibold mb-2">Emergency Services</h3>
              <p className="text-sm text-muted-foreground">
                Request emergency assistance with one tap. Track ambulance arrival in real-time.
              </p>
            </div>

            <div className="text-center p-6 rounded-lg border bg-card">
              <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="font-semibold mb-2">Health Alerts</h3>
              <p className="text-sm text-muted-foreground">
                Receive timely health advisories and outbreak notifications for your region.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">5,000+</div>
              <div className="text-primary-foreground/80">Healthcare Facilities</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">16</div>
              <div className="text-primary-foreground/80">Regions Covered</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-primary-foreground/80">Emergency Support</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">100%</div>
              <div className="text-primary-foreground/80">Free to Use</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Using shared Footer component with Newsletter */}
      <Footer />

      {/* Emergency Request Modal */}
      {showEmergencyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md sm:mx-auto p-4 sm:p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowEmergencyModal(false)}
              className="absolute top-3 right-3 p-2 hover:bg-gray-100 rounded-full min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Ambulance className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Request Emergency Service</h3>
              <p className="text-gray-600 mt-2">Select the type of emergency assistance you need</p>
            </div>

            <div className="space-y-3 mb-6">
              <Link
                href="/emergency"
                className="flex items-center gap-4 p-4 border rounded-lg hover:bg-red-50 hover:border-red-200 transition-colors"
              >
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Ambulance className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Ambulance Service</p>
                  <p className="text-sm text-gray-500">Request emergency medical transport</p>
                </div>
              </Link>

              <Link
                href="/emergency"
                className="flex items-center gap-4 p-4 border rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Phone className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Medical Emergency</p>
                  <p className="text-sm text-gray-500">Report a medical emergency</p>
                </div>
              </Link>

              <Link
                href="/emergency"
                className="flex items-center gap-4 p-4 border rounded-lg hover:bg-amber-50 hover:border-amber-200 transition-colors"
              >
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Accident/Trauma</p>
                  <p className="text-sm text-gray-500">Report an accident or injury</p>
                </div>
              </Link>
            </div>

            <div className="flex gap-3">
              <a
                href="tel:112"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
              >
                <Phone className="h-5 w-5" />
                Call 112
              </a>
              <a
                href="tel:193"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                <Ambulance className="h-5 w-5" />
                Call 193
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Notification Settings Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md sm:mx-auto p-4 sm:p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowNotificationModal(false)}
              className="absolute top-3 right-3 p-2 hover:bg-gray-100 rounded-full min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Health Notifications</h3>
              <p className="text-gray-600 mt-2">
                Get notified about health news and alerts in your area
              </p>
            </div>

            {notificationsEnabled ? (
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-emerald-600 mb-4">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  <span className="font-medium">Notifications Enabled</span>
                </div>
                <p className="text-sm text-gray-600 mb-6">
                  You will receive health alerts and news updates for your current location.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm">Disease Outbreaks</span>
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">On</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm">Health Advisories</span>
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">On</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm">Local Health News</span>
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">On</span>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Disease Outbreak Alerts</p>
                      <p className="text-sm text-gray-500">Get notified about disease outbreaks in your region</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Newspaper className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Health News</p>
                      <p className="text-sm text-gray-500">Stay updated with the latest health news</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MapPin className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Location-Based Alerts</p>
                      <p className="text-sm text-gray-500">Receive alerts specific to your current location</p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={enableNotifications}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Enable Notifications
                </Button>
                <p className="text-xs text-gray-500 text-center mt-3">
                  You can disable notifications anytime from your browser settings
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
