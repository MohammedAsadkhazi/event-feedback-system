import { DisplayStars } from "@/components/StarRating";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetActiveEvents,
  useGetEventStats,
  useGetOverallStats,
} from "@/hooks/useQueries";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart2,
  Calendar,
  CheckCircle,
  MessageSquare,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import { motion } from "motion/react";

const CATEGORY_COLORS: Record<string, string> = {
  Technology: "bg-primary/20 text-primary border-primary/30",
  Music: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  Business: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  Arts: "bg-rose-500/20 text-rose-300 border-rose-500/30",
  Sports: "bg-green-500/20 text-green-300 border-green-500/30",
  Education: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
};

const IMAGE_FALLBACKS: Record<string, string> = {
  Technology: "/assets/generated/event-placeholder-tech.dim_800x450.jpg",
  Music: "/assets/generated/event-placeholder-music.dim_800x450.jpg",
  Business: "/assets/generated/event-placeholder-workshop.dim_800x450.jpg",
  default: "/assets/generated/event-placeholder-tech.dim_800x450.jpg",
};

function EventCard({
  event,
  index,
}: {
  event: {
    id: bigint;
    title: string;
    date: string;
    category: string;
    location: string;
    imageUrl: string;
    isActive: boolean;
  };
  index: number;
}) {
  const { data: stats } = useGetEventStats(event.id);
  const imgSrc =
    event.imageUrl ||
    IMAGE_FALLBACKS[event.category] ||
    IMAGE_FALLBACKS.default;
  const catColor =
    CATEGORY_COLORS[event.category] ||
    "bg-muted text-muted-foreground border-border";

  return (
    <motion.div
      data-ocid={`event.item.${index + 1}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="glass rounded-xl overflow-hidden card-hover group"
    >
      <div className="relative h-44 overflow-hidden">
        <img
          src={imgSrc}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = IMAGE_FALLBACKS.default;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card/90 to-transparent" />
        <Badge className={`absolute top-3 left-3 border text-xs ${catColor}`}>
          {event.category}
        </Badge>
        {stats && stats.totalCount > 0 && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1">
            <Star size={11} className="fill-accent text-accent" />
            <span className="text-xs font-bold text-accent">
              {stats.avgOverallRating.toFixed(1)}
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
          <Calendar size={11} />
          <span>{event.date}</span>
        </div>
        <h3 className="font-display font-semibold text-foreground mb-1 line-clamp-2 group-hover:text-primary transition-colors">
          {event.title}
        </h3>
        <p className="text-xs text-muted-foreground mb-3 line-clamp-1">
          📍 {event.location}
        </p>
        {stats && stats.totalCount > 0 ? (
          <div className="flex items-center gap-2 mb-3">
            <DisplayStars rating={stats.avgOverallRating} size="sm" />
            <span className="text-xs text-muted-foreground">
              ({Number(stats.totalCount)})
            </span>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground mb-3 italic">
            No feedback yet
          </p>
        )}
        <Link to="/events/$id" params={{ id: event.id.toString() }}>
          <Button
            size="sm"
            className="w-full bg-primary/15 hover:bg-primary/30 text-primary border border-primary/30 hover:border-primary/60 transition-all"
          >
            Give Feedback <ArrowRight size={13} className="ml-1" />
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}

const floatingStats = [
  { label: "Avg Rating", icon: Star, color: "text-accent", key: "avgRating" },
  { label: "Events", icon: Calendar, color: "text-primary", key: "events" },
  {
    label: "Responses",
    icon: Users,
    color: "text-purple-400",
    key: "responses",
  },
];

const statsBarItems = [
  {
    label: "Total Events",
    icon: Calendar,
    suffix: "",
    color: "text-primary",
    key: "totalEvents",
  },
  {
    label: "Feedback Collected",
    icon: MessageSquare,
    suffix: "+",
    color: "text-purple-400",
    key: "totalFeedback",
  },
  {
    label: "Average Rating",
    icon: Star,
    suffix: "/5",
    color: "text-accent",
    key: "avgRating",
  },
  {
    label: "Recommend Rate",
    icon: TrendingUp,
    suffix: "%",
    color: "text-green-400",
    key: "recommendRate",
  },
];

const steps = [
  {
    icon: Calendar,
    title: "Browse Events",
    desc: "Discover active events and conferences you attended.",
    color: "text-primary",
    bg: "bg-primary/20",
  },
  {
    icon: MessageSquare,
    title: "Submit Feedback",
    desc: "Rate and comment on content, organization, and venue.",
    color: "text-purple-400",
    bg: "bg-purple-500/20",
  },
  {
    icon: BarChart2,
    title: "View Results",
    desc: "Organizers analyze feedback to improve future events.",
    color: "text-accent",
    bg: "bg-accent/20",
  },
];

export default function HomePage() {
  const { data: stats, isLoading: statsLoading } = useGetOverallStats();
  const { data: events, isLoading: eventsLoading } = useGetActiveEvents();

  const floatingValues = [
    stats ? stats.avgOverallRating.toFixed(1) : "4.8",
    stats ? Number(stats.totalEvents).toString() : "24+",
    stats ? Number(stats.totalFeedback).toString() : "500+",
  ];

  const statsBarValues = [
    stats ? Number(stats.totalEvents) : 0,
    stats ? Number(stats.totalFeedback) : 0,
    stats ? stats.avgOverallRating.toFixed(1) : "0.0",
    stats ? Math.round(stats.recommendRate * 100) : 0,
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/assets/generated/hero-event-feedback.dim_1600x900.jpg"
            alt=""
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 aurora-bg opacity-80" />
        </div>

        <div className="relative container mx-auto px-4 py-24">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-3xl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/40 bg-primary/10 text-primary text-xs font-medium mb-6"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Real-time Event Intelligence
            </motion.div>

            <h1 className="font-display font-extrabold text-5xl md:text-7xl leading-[1.05] mb-6 tracking-tight">
              Collect. <span className="text-gradient">Analyze.</span> <br />
              Improve.
            </h1>

            <p className="text-lg text-muted-foreground mb-8 max-w-xl leading-relaxed">
              The complete event feedback platform. Gather actionable insights
              from attendees, analyze performance metrics, and continuously
              improve your events.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link to="/events">
                <Button
                  data-ocid="home.hero.primary_button"
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 glow-teal font-semibold px-6"
                >
                  Explore Events <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
              <Link to="/admin">
                <Button
                  data-ocid="home.hero.secondary_button"
                  size="lg"
                  variant="outline"
                  className="border-border/80 hover:border-primary/50 hover:bg-primary/10"
                >
                  Admin Dashboard
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Floating stat cards */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="absolute right-8 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-4"
        >
          {floatingStats.map((item, i) => (
            <div
              key={item.key}
              className="glass rounded-xl p-4 min-w-[140px] text-center"
            >
              <item.icon size={20} className={`mx-auto mb-1 ${item.color}`} />
              <div className={`text-2xl font-display font-bold ${item.color}`}>
                {floatingValues[i]}
              </div>
              <div className="text-xs text-muted-foreground">{item.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-border/50 bg-card/30 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {statsLoading
              ? ["s1", "s2", "s3", "s4"].map((sk) => (
                  <div key={sk} className="flex flex-col items-center gap-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))
              : statsBarItems.map((stat, i) => (
                  <motion.div
                    key={stat.key}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex flex-col items-center gap-1"
                  >
                    <stat.icon size={18} className={`${stat.color} mb-1`} />
                    <span
                      className={`text-3xl font-display font-extrabold ${stat.color}`}
                    >
                      {statsBarValues[i]}
                      {stat.suffix}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {stat.label}
                    </span>
                  </motion.div>
                ))}
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-10"
        >
          <div>
            <p className="text-primary text-sm font-medium mb-2 uppercase tracking-widest">
              Active Events
            </p>
            <h2 className="font-display font-bold text-3xl md:text-4xl">
              Featured Events
            </h2>
          </div>
          <Link to="/events">
            <Button
              variant="ghost"
              className="text-primary hover:text-primary hover:bg-primary/10"
            >
              View All <ArrowRight size={14} className="ml-1" />
            </Button>
          </Link>
        </motion.div>

        {eventsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {["s1", "s2", "s3"].map((sk) => (
              <div key={sk} className="glass rounded-xl overflow-hidden">
                <Skeleton className="h-44 w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : events && events.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.slice(0, 6).map((event, i) => (
              <EventCard key={event.id.toString()} event={event} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <Calendar size={40} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg">No active events yet.</p>
            <p className="text-sm mt-1">
              Check back soon or visit the admin panel to create events.
            </p>
          </div>
        )}
      </section>

      {/* How It Works */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-card/20" />
        <div className="relative container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <p className="text-primary text-sm font-medium mb-2 uppercase tracking-widest">
              Simple Process
            </p>
            <h2 className="font-display font-bold text-3xl md:text-4xl">
              How It Works
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-1/4 right-1/4 h-px bg-gradient-to-r from-primary/30 via-purple-500/30 to-accent/30" />
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center"
              >
                <div className="w-20 h-20 mx-auto mb-5 rounded-2xl glass flex items-center justify-center border border-border/60">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${step.bg}`}
                  >
                    <step.icon size={22} className={step.color} />
                  </div>
                </div>
                <div
                  className={`text-4xl font-display font-black mb-3 ${step.color} opacity-20`}
                >
                  0{i + 1}
                </div>
                <h3 className="font-display font-bold text-lg mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-2xl p-10 md:p-16 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
          <div className="relative">
            <CheckCircle size={40} className="mx-auto mb-4 text-primary" />
            <h2 className="font-display font-bold text-3xl md:text-4xl mb-4">
              Ready to Improve Your Events?
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              Start collecting structured feedback today and transform attendee
              insights into actionable improvements.
            </p>
            <Link to="/events">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 glow-teal font-semibold"
              >
                Browse Events <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
