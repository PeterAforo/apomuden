"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Newspaper,
  Calendar,
  MapPin,
  Search,
  Filter,
  ChevronRight,
  Clock,
  Tag,
  TrendingUp,
  Globe,
  Heart,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

interface HealthNews {
  id: string;
  title: string;
  summary: string;
  content?: string;
  category: string;
  date: string;
  image: string;
  isLocal: boolean;
  author?: string;
  readTime?: number;
  tags?: string[];
  slug?: string;
}

// Helper to create URL-friendly slugs
function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const CATEGORIES = [
  { id: "all", label: "All News", icon: Newspaper },
  { id: "vaccination", label: "Vaccination", icon: Heart },
  { id: "prevention", label: "Prevention", icon: TrendingUp },
  { id: "mental-health", label: "Mental Health", icon: Globe },
  { id: "covid-19", label: "COVID-19", icon: Tag },
  { id: "local", label: "Local News", icon: MapPin },
];

const MOCK_NEWS: HealthNews[] = [
  {
    id: "1",
    title: "Ghana Health Service Launches New Vaccination Campaign",
    summary: "A nationwide vaccination drive targeting children under 5 begins next week across all 16 regions. The campaign aims to immunize over 2 million children against preventable diseases.",
    content: "The Ghana Health Service has announced a comprehensive vaccination campaign...",
    category: "Vaccination",
    date: "2024-01-15",
    image: "https://images.unsplash.com/photo-1609220136736-443140cffec6?w=800&q=80",
    isLocal: false,
    author: "Ghana Health Service",
    readTime: 5,
    tags: ["vaccination", "children", "health campaign"],
  },
  {
    id: "2",
    title: "Malaria Prevention Tips for the Rainy Season",
    summary: "Health experts advise on protective measures as malaria cases typically rise during the wet season. Learn how to protect yourself and your family.",
    category: "Prevention",
    date: "2024-01-14",
    image: "https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=800&q=80",
    isLocal: true,
    author: "Dr. Kwame Asante",
    readTime: 4,
    tags: ["malaria", "prevention", "rainy season"],
  },
  {
    id: "3",
    title: "New Mental Health Hotline Launched",
    summary: "Ministry of Health introduces 24/7 mental health support line for all Ghanaians. Professional counselors are available around the clock.",
    category: "Mental Health",
    date: "2024-01-13",
    image: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=800&q=80",
    isLocal: false,
    author: "Ministry of Health",
    readTime: 3,
    tags: ["mental health", "hotline", "support"],
  },
  {
    id: "4",
    title: "COVID-19 Booster Shots Now Available",
    summary: "Updated booster vaccines are now available at all regional hospitals and select health centers. Priority given to healthcare workers and elderly.",
    category: "COVID-19",
    date: "2024-01-12",
    image: "https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?w=800&q=80",
    isLocal: false,
    author: "Ghana Health Service",
    readTime: 4,
    tags: ["covid-19", "vaccine", "booster"],
  },
  {
    id: "5",
    title: "New Hospital Opens in Kumasi",
    summary: "A state-of-the-art 200-bed hospital has been inaugurated in Kumasi, expanding healthcare access in the Ashanti Region.",
    category: "Local",
    date: "2024-01-11",
    image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&q=80",
    isLocal: true,
    author: "Regional Health Directorate",
    readTime: 6,
    tags: ["hospital", "kumasi", "healthcare"],
  },
  {
    id: "6",
    title: "Cholera Prevention Measures Intensified",
    summary: "Following recent cases in some communities, health authorities have intensified cholera prevention measures including water treatment and hygiene education.",
    category: "Prevention",
    date: "2024-01-10",
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=800&q=80",
    isLocal: true,
    author: "Disease Surveillance Unit",
    readTime: 5,
    tags: ["cholera", "prevention", "water safety"],
  },
  {
    id: "7",
    title: "Free Health Screening Week Announced",
    summary: "The Ministry of Health announces a week-long free health screening program at all government hospitals starting next month.",
    category: "Prevention",
    date: "2024-01-09",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&q=80",
    isLocal: false,
    author: "Ministry of Health",
    readTime: 3,
    tags: ["screening", "free healthcare", "prevention"],
  },
  {
    id: "8",
    title: "Youth Mental Health Awareness Program Launches",
    summary: "A new program targeting mental health awareness among youth has been launched in partnership with schools across Ghana.",
    category: "Mental Health",
    date: "2024-01-08",
    image: "https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=800&q=80",
    isLocal: false,
    author: "Mental Health Authority",
    readTime: 4,
    tags: ["youth", "mental health", "schools"],
  },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function NewsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filteredNews, setFilteredNews] = useState<HealthNews[]>(MOCK_NEWS);

  useEffect(() => {
    let filtered = MOCK_NEWS;

    // Filter by category
    if (selectedCategory !== "all") {
      if (selectedCategory === "local") {
        filtered = filtered.filter((news) => news.isLocal);
      } else {
        filtered = filtered.filter(
          (news) => news.category.toLowerCase().replace(" ", "-") === selectedCategory
        );
      }
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (news) =>
          news.title.toLowerCase().includes(query) ||
          news.summary.toLowerCase().includes(query) ||
          news.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    setFilteredNews(filtered);
  }, [searchQuery, selectedCategory]);

  const featuredNews = MOCK_NEWS[0];
  const trendingNews = MOCK_NEWS.slice(1, 4);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 mb-6">
              <Newspaper className="w-5 h-5" />
              <span className="text-sm font-medium">Health News & Updates</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Stay Informed About Your Health
            </h1>
            <p className="text-lg text-emerald-100 mb-8">
              Get the latest health news, updates, and advisories from Ghana Health Service
            </p>

            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search news, topics, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Category Filters */}
      <section className="bg-white border-b sticky top-16 z-30">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 py-4 overflow-x-auto scrollbar-hide">
            {CATEGORIES.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === category.id
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {category.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Featured Article */}
        {selectedCategory === "all" && !searchQuery && (
          <motion.section
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Story</h2>
            <Link href={`/news/${createSlug(featuredNews.title)}`}>
              <div className="relative rounded-2xl overflow-hidden bg-white shadow-lg group cursor-pointer">
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="relative h-64 md:h-96">
                    <Image
                      src={featuredNews.image}
                      alt={featuredNews.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {featuredNews.isLocal && (
                      <span className="absolute top-4 left-4 bg-emerald-600 text-white text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        Local
                      </span>
                    )}
                  </div>
                  <div className="p-6 md:p-8 flex flex-col justify-center">
                    <span className="text-emerald-600 text-sm font-medium mb-2">
                      {featuredNews.category}
                    </span>
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 group-hover:text-emerald-600 transition-colors">
                      {featuredNews.title}
                    </h3>
                    <p className="text-gray-600 mb-6 line-clamp-3">
                      {featuredNews.summary}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(featuredNews.date).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {featuredNews.readTime} min read
                      </span>
                    </div>
                    <div className="mt-6">
                      <span className="inline-flex items-center gap-2 text-emerald-600 font-medium group-hover:gap-3 transition-all">
                        Read Full Story
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.section>
        )}

        {/* Trending Section */}
        {selectedCategory === "all" && !searchQuery && (
          <motion.section
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
              Trending Now
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {trendingNews.map((news, index) => (
                <motion.div key={news.id} variants={fadeInUp}>
                  <Link href={`/news/${createSlug(news.title)}`}>
                    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                      <div className="relative h-48">
                        <Image
                          src={news.image}
                          alt={news.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-emerald-600 text-xs font-bold px-2 py-1 rounded">
                          #{index + 1} Trending
                        </div>
                      </div>
                      <div className="p-4">
                        <span className="text-xs text-emerald-600 font-medium">
                          {news.category}
                        </span>
                        <h3 className="font-semibold text-gray-900 mt-1 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                          {news.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {news.readTime} min read
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* All News Grid */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedCategory === "all" ? "Latest News" : `${CATEGORIES.find(c => c.id === selectedCategory)?.label}`}
            </h2>
            <span className="text-sm text-gray-500">
              {filteredNews.length} article{filteredNews.length !== 1 ? "s" : ""}
            </span>
          </div>

          {filteredNews.length === 0 ? (
            <div className="text-center py-12">
              <Newspaper className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredNews.map((news) => (
                <motion.div key={news.id} variants={fadeInUp}>
                  <Link href={`/news/${createSlug(news.title)}`}>
                    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group h-full flex flex-col">
                      <div className="relative h-48">
                        <Image
                          src={news.image}
                          alt={news.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {news.isLocal && (
                          <span className="absolute top-3 left-3 bg-emerald-600 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            Local
                          </span>
                        )}
                      </div>
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded">
                            {news.category}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                          {news.title}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-1">
                          {news.summary}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(news.date).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {news.readTime} min
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </section>
      </div>

      <Footer />
    </div>
  );
}
