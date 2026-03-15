"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  MapPin,
  ChevronLeft,
  Share2,
  Bookmark,
  Facebook,
  Twitter,
  Linkedin,
  Copy,
  Check,
  Tag,
  User,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

interface HealthNews {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  date: string;
  image: string;
  isLocal: boolean;
  author: string;
  readTime: number;
  tags: string[];
}

const MOCK_NEWS: Record<string, HealthNews> = {
  "1": {
    id: "1",
    title: "Ghana Health Service Launches New Vaccination Campaign",
    summary: "A nationwide vaccination drive targeting children under 5 begins next week across all 16 regions.",
    content: `
      <p>The Ghana Health Service has announced a comprehensive nationwide vaccination campaign targeting children under the age of 5. This initiative, set to begin next week, aims to immunize over 2 million children against preventable diseases including measles, polio, and yellow fever.</p>
      
      <h2>Campaign Details</h2>
      <p>The vaccination drive will be conducted across all 16 regions of Ghana, with mobile vaccination units deployed to reach remote communities. Health workers have been trained and equipped to handle the logistics of this massive undertaking.</p>
      
      <p>"This campaign represents our commitment to ensuring every child in Ghana has access to life-saving vaccines," said Dr. Patrick Kuma-Aboagye, Director-General of the Ghana Health Service. "We urge all parents and guardians to bring their children to the nearest vaccination point."</p>
      
      <h2>Vaccination Schedule</h2>
      <p>The campaign will run for two weeks, with vaccination points set up at:</p>
      <ul>
        <li>All government hospitals and health centers</li>
        <li>Selected schools and community centers</li>
        <li>Mobile units in rural areas</li>
        <li>Market centers and public gathering points</li>
      </ul>
      
      <h2>What Parents Need to Know</h2>
      <p>Parents are advised to bring their child's health record book to the vaccination point. The vaccines are provided free of charge as part of the government's commitment to child health.</p>
      
      <p>For more information, contact your nearest health facility or call the Ghana Health Service hotline at 0800-000-000.</p>
    `,
    category: "Vaccination",
    date: "2024-01-15",
    image: "https://images.unsplash.com/photo-1584515933487-779824d29309?w=1200&q=80",
    isLocal: false,
    author: "Ghana Health Service",
    readTime: 5,
    tags: ["vaccination", "children", "health campaign", "immunization"],
  },
  "2": {
    id: "2",
    title: "Malaria Prevention Tips for the Rainy Season",
    summary: "Health experts advise on protective measures as malaria cases typically rise during the wet season.",
    content: `
      <p>As Ghana enters the rainy season, health experts are urging citizens to take extra precautions against malaria, which typically sees a surge in cases during this period. The increased rainfall creates breeding grounds for mosquitoes, the primary carriers of the malaria parasite.</p>
      
      <h2>Understanding the Risk</h2>
      <p>Malaria remains one of the leading causes of illness and death in Ghana, particularly among children under 5 and pregnant women. The rainy season, which runs from April to October, sees a significant increase in mosquito populations.</p>
      
      <h2>Prevention Measures</h2>
      <p>Dr. Kwame Asante, a public health specialist, recommends the following preventive measures:</p>
      <ul>
        <li><strong>Sleep under insecticide-treated nets (ITNs):</strong> Ensure all family members, especially children and pregnant women, sleep under treated nets every night.</li>
        <li><strong>Use mosquito repellents:</strong> Apply repellent to exposed skin, especially during evening hours.</li>
        <li><strong>Eliminate breeding sites:</strong> Remove stagnant water around your home, including in old tires, containers, and gutters.</li>
        <li><strong>Wear protective clothing:</strong> Long sleeves and pants during evening hours can reduce mosquito bites.</li>
        <li><strong>Use window screens:</strong> Install screens on windows and doors to keep mosquitoes out.</li>
      </ul>
      
      <h2>Recognizing Symptoms</h2>
      <p>Early detection and treatment are crucial. Seek medical attention immediately if you experience:</p>
      <ul>
        <li>High fever</li>
        <li>Chills and sweating</li>
        <li>Headache</li>
        <li>Body aches</li>
        <li>Nausea and vomiting</li>
      </ul>
      
      <p>Visit your nearest health facility for testing if you suspect malaria. Early treatment can prevent severe complications.</p>
    `,
    category: "Prevention",
    date: "2024-01-14",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&q=80",
    isLocal: true,
    author: "Dr. Kwame Asante",
    readTime: 4,
    tags: ["malaria", "prevention", "rainy season", "mosquito"],
  },
  "3": {
    id: "3",
    title: "New Mental Health Hotline Launched",
    summary: "Ministry of Health introduces 24/7 mental health support line for all Ghanaians.",
    content: `
      <p>The Ministry of Health has officially launched a 24/7 mental health support hotline, marking a significant step forward in addressing mental health challenges in Ghana. The service provides free, confidential support to anyone experiencing mental health difficulties.</p>
      
      <h2>About the Service</h2>
      <p>The hotline, accessible by dialing 0800-MENTAL (0800-636825), connects callers with trained mental health professionals who can provide immediate support, counseling, and referrals to appropriate services.</p>
      
      <h2>Services Available</h2>
      <ul>
        <li>Crisis intervention and suicide prevention</li>
        <li>Emotional support and counseling</li>
        <li>Information about mental health conditions</li>
        <li>Referrals to mental health facilities</li>
        <li>Support for family members of those with mental health conditions</li>
      </ul>
      
      <h2>Breaking the Stigma</h2>
      <p>"Mental health is just as important as physical health," said the Minister of Health. "This hotline is part of our broader effort to make mental health services accessible to all Ghanaians and to reduce the stigma associated with seeking help."</p>
      
      <p>The service is available in English, Twi, Ga, and Ewe to ensure accessibility across different communities.</p>
    `,
    category: "Mental Health",
    date: "2024-01-13",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1200&q=80",
    isLocal: false,
    author: "Ministry of Health",
    readTime: 3,
    tags: ["mental health", "hotline", "support", "counseling"],
  },
  "4": {
    id: "4",
    title: "COVID-19 Booster Shots Now Available",
    summary: "Updated booster vaccines are now available at all regional hospitals and select health centers.",
    content: `
      <p>The Ghana Health Service has announced that updated COVID-19 booster vaccines are now available at all regional hospitals and select health centers across the country. The new boosters provide enhanced protection against current variants of the virus.</p>
      
      <h2>Who Should Get Boosted?</h2>
      <p>The following groups are prioritized for the booster shots:</p>
      <ul>
        <li>Healthcare workers</li>
        <li>Adults aged 60 and above</li>
        <li>Individuals with underlying health conditions</li>
        <li>Pregnant women</li>
        <li>Anyone who completed their primary vaccination series more than 6 months ago</li>
      </ul>
      
      <h2>Where to Get Vaccinated</h2>
      <p>Booster shots are available at:</p>
      <ul>
        <li>All regional and district hospitals</li>
        <li>Selected health centers (check with your local facility)</li>
        <li>Designated vaccination sites in major cities</li>
      </ul>
      
      <p>No appointment is necessary. Simply bring your vaccination card and a valid ID.</p>
    `,
    category: "COVID-19",
    date: "2024-01-12",
    image: "https://images.unsplash.com/photo-1615631648086-325025c9e51e?w=1200&q=80",
    isLocal: false,
    author: "Ghana Health Service",
    readTime: 4,
    tags: ["covid-19", "vaccine", "booster", "immunization"],
  },
};

const RELATED_NEWS = [
  {
    id: "5",
    title: "New Hospital Opens in Kumasi",
    category: "Local",
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&q=80",
    date: "2024-01-11",
  },
  {
    id: "6",
    title: "Cholera Prevention Measures Intensified",
    category: "Prevention",
    image: "https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=400&q=80",
    date: "2024-01-10",
  },
  {
    id: "7",
    title: "Free Health Screening Week Announced",
    category: "Prevention",
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&q=80",
    date: "2024-01-09",
  },
];

export default function NewsDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [news, setNews] = useState<HealthNews | null>(null);
  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    const id = params.id as string;
    const article = MOCK_NEWS[id];
    if (article) {
      setNews(article);
    }
  }, [params.id]);

  const handleShare = async (platform: string) => {
    const url = window.location.href;
    const title = news?.title || "";

    switch (platform) {
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
        break;
      case "twitter":
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, "_blank");
        break;
      case "linkedin":
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank");
        break;
      case "copy":
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        break;
    }
  };

  if (!news) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
          <p className="text-gray-600 mb-8">The article you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/news" className="text-emerald-600 hover:text-emerald-700 font-medium">
            ← Back to News
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Image */}
      <div className="relative h-[40vh] md:h-[50vh] w-full">
        <Image
          src={news.image}
          alt={news.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        
        {/* Back Button */}
        <div className="absolute top-4 left-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 bg-white/90 backdrop-blur-sm text-gray-900 px-4 py-2 rounded-full hover:bg-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        {/* Category Badge */}
        <div className="absolute bottom-6 left-4 md:left-8">
          <div className="flex items-center gap-3">
            <span className="bg-emerald-600 text-white text-sm font-medium px-4 py-1.5 rounded-full">
              {news.category}
            </span>
            {news.isLocal && (
              <span className="bg-white/90 text-emerald-600 text-sm font-medium px-4 py-1.5 rounded-full flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                Local News
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Article Content */}
      <article className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-6"
          >
            {news.title}
          </motion.h1>

          {/* Meta Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-8 pb-8 border-b"
          >
            <span className="flex items-center gap-2">
              <User className="w-4 h-4" />
              {news.author}
            </span>
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date(news.date).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {news.readTime} min read
            </span>
          </motion.div>

          {/* Summary */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-700 leading-relaxed mb-8 font-medium"
          >
            {news.summary}
          </motion.p>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700 prose-strong:text-gray-900"
            dangerouslySetInnerHTML={{ __html: news.content }}
          />

          {/* Tags */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 pt-8 border-t"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="w-4 h-4 text-gray-500" />
              {news.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/news?search=${tag}`}
                  className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full hover:bg-emerald-100 hover:text-emerald-700 transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Share & Bookmark */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 pt-8 border-t"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 mr-2">Share:</span>
                <button
                  onClick={() => handleShare("facebook")}
                  className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                  title="Share on Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleShare("twitter")}
                  className="p-2 bg-sky-500 text-white rounded-full hover:bg-sky-600 transition-colors"
                  title="Share on Twitter"
                >
                  <Twitter className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleShare("linkedin")}
                  className="p-2 bg-blue-700 text-white rounded-full hover:bg-blue-800 transition-colors"
                  title="Share on LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleShare("copy")}
                  className="p-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors"
                  title="Copy link"
                >
                  {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <button
                onClick={() => setBookmarked(!bookmarked)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                  bookmarked
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Bookmark className={`w-4 h-4 ${bookmarked ? "fill-current" : ""}`} />
                {bookmarked ? "Saved" : "Save"}
              </button>
            </div>
          </motion.div>
        </div>
      </article>

      {/* Related Articles */}
      <section className="bg-white py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Articles</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {RELATED_NEWS.map((article) => (
              <Link key={article.id} href={`/news/${article.id}`}>
                <div className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-md transition-shadow group">
                  <div className="relative h-40">
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <span className="text-xs text-emerald-600 font-medium">
                      {article.category}
                    </span>
                    <h3 className="font-semibold text-gray-900 mt-1 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(article.date).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
