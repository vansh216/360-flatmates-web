import { useState } from "react";
import { Link } from "react-router";
import { SeoHelmet, SITE_URL, buildCollectionPageSchema } from "@/lib/seo";
import { Card } from "@/components/ui/Card";
import { NetworkImage } from "@/components/ui/NetworkImage";
import { ArrowRight, Calendar, Clock } from "lucide-react";

const BLOG_POSTS = [
  {
    slug: "how-to-find-compatible-flatmates",
    title: "How to Find Compatible Flatmates: A Complete Guide",
    excerpt: "Learn the 6 key dimensions that determine flatmate compatibility and how to evaluate potential matches before moving in.",
    category: "Guide",
    readTime: "8 min read",
    date: "May 2025",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&fm=webp&fit=crop&q=80",
  },
  {
    slug: "flatmate-agreement-essentials",
    title: "The Essential Flatmate Agreement Checklist",
    excerpt: "Everything you need to cover in a flatmate agreement, from rent splitting to guest policies to cleaning schedules.",
    category: "Guide",
    readTime: "6 min read",
    date: "April 2025",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&fm=webp&fit=crop&q=80",
  },
  {
    slug: "bangalore-rental-market-guide",
    title: "Bangalore Rental Market Guide 2025",
    excerpt: "Average rents, best neighborhoods, and what to look for when renting in India's tech capital.",
    category: "Market Insights",
    readTime: "10 min read",
    date: "March 2025",
    image: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=800&fm=webp&fit=crop&q=80",
  },
  {
    slug: "moving-in-with-strangers",
    title: "Moving in with Strangers: Tips from Real Flatmates",
    excerpt: "Real stories and practical advice from people who successfully found flatmates through 360 Flatmates.",
    category: "Community",
    readTime: "5 min read",
    date: "February 2025",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&fm=webp&fit=crop&q=80",
  },
  {
    slug: "room-inspection-checklist",
    title: "Room Inspection Checklist: What to Look For",
    excerpt: "A comprehensive checklist for inspecting rooms before committing, from water pressure to mobile network coverage.",
    category: "Guide",
    readTime: "7 min read",
    date: "January 2025",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&fm=webp&fit=crop&q=80",
  },
  {
    slug: "flatmate-conflict-resolution",
    title: "How to Handle Flatmate Conflicts Gracefully",
    excerpt: "Practical strategies for resolving common flatmate disagreements without damaging the relationship.",
    category: "Community",
    readTime: "6 min read",
    date: "December 2024",
    image: "https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=800&fm=webp&fit=crop&q=80",
  },
];

const CATEGORIES = ["All", "Guide", "Market Insights", "Community"];

export function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const breadcrumb = [{ name: "Blog", item: `${SITE_URL}/blog` }];

  const collectionLd = buildCollectionPageSchema({
    name: "Flatmate Living Guides & Tips",
    description:
      "Expert guides on finding compatible flatmates, navigating rental markets, and building harmonious shared living spaces across India.",
    url: `${SITE_URL}/blog`,
    breadcrumb,
  });

  const filteredPosts = activeCategory === "All"
    ? BLOG_POSTS
    : BLOG_POSTS.filter((post) => post.category === activeCategory);

  return (
    <>
      <SeoHelmet
        title="Flatmate Living Guides & Tips"
        description="Expert guides on finding compatible flatmates, navigating rental markets, and building harmonious shared living spaces across India."
        canonicalUrl={`${SITE_URL}/blog`}
        breadcrumb={breadcrumb}
        jsonLd={collectionLd}
      />

      <main id="main" className="page-fade mx-auto max-w-7xl px-5 py-16 md:px-12">
        <div className="text-center mb-16">
          <p className="text-eyebrow text-accent uppercase tracking-widest">Resources</p>
          <h1 className="mt-4 text-display text-4xl md:text-6xl text-ink font-normal leading-tight tracking-tight max-w-3xl mx-auto">
            Flatmate Living <span className="text-serif-italic text-accent italic font-normal text-5xl md:text-7xl">guides & tips</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-body-lg text-ink-2">
            Expert advice, market insights, and real stories to help you find the perfect flatmate and make shared living work.
          </p>
        </div>

        <div className="flex justify-center gap-3 flex-wrap">
          {CATEGORIES.map((cat) => {
            const isActive = cat === activeCategory;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-label-md transition-all duration-300 hover:scale-[1.04] active:scale-95 cursor-pointer ${
                  isActive
                    ? "border border-accent bg-accent-soft text-accent shadow-xs"
                    : "border border-line-low bg-paper text-ink-2 hover:border-accent hover:text-accent hover:bg-surface"
                }`}
                style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post, index) => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className="block group card-appear"
              style={{ animationDelay: `${Math.min(index, 5) * 50}ms` }}
            >
              <Card
                className="overflow-hidden h-full flex flex-col border border-line-low hover:border-accent/20 hover:shadow-md transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]"
                style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
              >
                <div className="relative h-56 overflow-hidden bg-paper">
                  <NetworkImage
                    src={post.image}
                    alt={post.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-103"
                    width={800}
                    height={400}
                    loading="lazy"
                    decoding="async"
                  />
                  <span className="absolute top-3 left-3 bg-surface/90 backdrop-blur-sm px-3.5 py-1 rounded-full text-label-md text-accent font-semibold">
                    {post.category}
                  </span>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-h3 text-ink group-hover:text-accent transition-colors line-clamp-2">{post.title}</h3>
                  <p className="text-body-md text-ink-2 mt-3 line-clamp-3 leading-relaxed flex-1">{post.excerpt}</p>
                  
                  <div className="mt-6 pt-4 border-t border-line-low flex items-center justify-between">
                    <div className="flex items-center gap-4 text-label-md text-ink-3">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {post.date}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {post.readTime}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-label-md text-accent font-semibold group-hover:translate-x-1 transition-transform duration-200">
                      Read <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
