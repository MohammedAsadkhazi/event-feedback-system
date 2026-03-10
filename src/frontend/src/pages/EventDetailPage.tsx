import { DisplayStars, StarRating } from "@/components/StarRating";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  useGetEvent,
  useGetEventStats,
  useGetFeedbackByEvent,
  useSubmitFeedback,
} from "@/hooks/useQueries";
import { Link, useParams } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  Loader2,
  MapPin,
  Tag,
  ThumbsDown,
  ThumbsUp,
  User,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

const IMAGE_FALLBACKS: Record<string, string> = {
  Technology: "/assets/generated/event-placeholder-tech.dim_800x450.jpg",
  Music: "/assets/generated/event-placeholder-music.dim_800x450.jpg",
  Business: "/assets/generated/event-placeholder-workshop.dim_800x450.jpg",
  default: "/assets/generated/event-placeholder-tech.dim_800x450.jpg",
};

function StatCard({
  label,
  value,
  sub,
}: { label: string; value: string; sub?: string }) {
  return (
    <div className="glass rounded-xl p-4 text-center">
      <div className="text-2xl font-display font-bold text-primary mb-0.5">
        {value}
      </div>
      <div className="text-xs font-medium text-foreground mb-0.5">{label}</div>
      {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

function FeedbackCard({
  feedback,
  index,
}: {
  feedback: {
    id: bigint;
    submitterName: string;
    submittedAt: bigint;
    overallRating: bigint;
    contentRating: bigint;
    organizationRating: bigint;
    venueRating: bigint;
    comment: string;
    wouldRecommend: boolean;
  };
  index: number;
}) {
  const date = new Date(Number(feedback.submittedAt) / 1_000_000);
  const formattedDate = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <motion.div
      data-ocid={`feedback.item.${index + 1}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass rounded-xl p-5"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
            {feedback.submitterName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground">
              {feedback.submitterName}
            </p>
            <p className="text-xs text-muted-foreground">{formattedDate}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DisplayStars rating={Number(feedback.overallRating)} size="sm" />
          {feedback.wouldRecommend ? (
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs flex items-center gap-1">
              <ThumbsUp size={10} /> Recommend
            </Badge>
          ) : (
            <Badge className="bg-muted text-muted-foreground border-border text-xs flex items-center gap-1">
              <ThumbsDown size={10} /> No
            </Badge>
          )}
        </div>
      </div>

      {feedback.comment && (
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          {feedback.comment}
        </p>
      )}

      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border/50">
        {[
          { label: "Content", rating: Number(feedback.contentRating) },
          {
            label: "Organization",
            rating: Number(feedback.organizationRating),
          },
          { label: "Venue", rating: Number(feedback.venueRating) },
        ].map((dim) => (
          <div key={dim.label} className="text-center">
            <div className="text-xs text-muted-foreground mb-1">
              {dim.label}
            </div>
            <div className="flex justify-center">
              <DisplayStars rating={dim.rating} size="sm" />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function EventDetailPage() {
  const { id } = useParams({ from: "/events/$id" });
  const eventId = id ? BigInt(id) : null;

  const { data: event, isLoading: eventLoading } = useGetEvent(eventId);
  const { data: feedbackList, isLoading: feedbackLoading } =
    useGetFeedbackByEvent(eventId);
  const { data: stats } = useGetEventStats(eventId);
  const submitMutation = useSubmitFeedback();

  const [form, setForm] = useState({
    name: "",
    email: "",
    overallRating: 0,
    contentRating: 0,
    organizationRating: 0,
    venueRating: 0,
    comment: "",
    wouldRecommend: true,
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!eventId) return;
    if (!form.name.trim() || !form.email.trim()) {
      setError("Please fill in your name and email.");
      return;
    }
    if (form.overallRating === 0) {
      setError("Please provide an overall rating.");
      return;
    }
    try {
      await submitMutation.mutateAsync({
        eventId,
        submitterName: form.name,
        submitterEmail: form.email,
        overallRating: form.overallRating,
        contentRating: form.contentRating || form.overallRating,
        organizationRating: form.organizationRating || form.overallRating,
        venueRating: form.venueRating || form.overallRating,
        comment: form.comment,
        wouldRecommend: form.wouldRecommend,
      });
      setSubmitted(true);
      toast.success("Feedback submitted! Thank you.");
    } catch {
      setError("Failed to submit feedback. Please try again.");
      toast.error("Submission failed.");
    }
  };

  if (eventLoading) {
    return (
      <div className="container mx-auto px-4 py-12 space-y-6">
        <Skeleton className="h-64 w-full rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {["s1", "s2", "s3", "s4"].map((sk) => (
            <Skeleton key={sk} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <AlertCircle
          size={48}
          className="mx-auto mb-4 text-destructive opacity-60"
        />
        <h2 className="text-2xl font-display font-bold mb-2">
          Event Not Found
        </h2>
        <Link to="/events">
          <Button variant="outline" className="mt-4">
            ← Back to Events
          </Button>
        </Link>
      </div>
    );
  }

  const imgSrc =
    event.imageUrl ||
    IMAGE_FALLBACKS[event.category] ||
    IMAGE_FALLBACKS.default;

  return (
    <div>
      {/* Event Hero */}
      <section className="relative h-72 md:h-96 overflow-hidden">
        <img
          src={imgSrc}
          alt={event.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = IMAGE_FALLBACKS.default;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute bottom-6 left-0 right-0 container mx-auto px-4">
          <Link
            to="/events"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-3 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Events
          </Link>
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <Badge
              className={`border text-xs ${
                event.category === "Technology"
                  ? "bg-primary/20 text-primary border-primary/30"
                  : event.category === "Music"
                    ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                    : "bg-muted text-muted-foreground border-border"
              }`}
            >
              {event.category}
            </Badge>
            {event.isActive && (
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />{" "}
                Active
              </Badge>
            )}
          </div>
          <h1 className="font-display font-extrabold text-3xl md:text-4xl text-foreground mb-2">
            {event.title}
          </h1>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar size={13} />
              {event.date}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin size={13} />
              {event.location}
            </span>
            <span className="flex items-center gap-1.5">
              <Tag size={13} />
              {event.category}
            </span>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10">
        {/* Description */}
        <p className="text-muted-foreground leading-relaxed max-w-3xl mb-10">
          {event.description}
        </p>

        {/* Stats */}
        {stats && stats.totalCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
          >
            <StatCard
              label="Overall Rating"
              value={stats.avgOverallRating.toFixed(1)}
              sub="out of 5"
            />
            <StatCard
              label="Total Feedback"
              value={Number(stats.totalCount).toString()}
              sub="responses"
            />
            <StatCard
              label="Recommend Rate"
              value={`${Math.round(stats.recommendRate * 100)}%`}
              sub="would attend again"
            />
            <StatCard
              label="Content Quality"
              value={stats.avgContentRating.toFixed(1)}
              sub="out of 5"
            />
          </motion.div>
        )}

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Feedback Form */}
          <div>
            <h2 className="font-display font-bold text-2xl mb-6">
              Share Your Experience
            </h2>

            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  data-ocid="feedback.success_state"
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass rounded-2xl p-10 text-center border border-green-500/30"
                >
                  <CheckCircle
                    size={48}
                    className="mx-auto mb-4 text-green-400"
                  />
                  <h3 className="font-display font-bold text-xl mb-2">
                    Feedback Submitted!
                  </h3>
                  <p className="text-muted-foreground text-sm mb-6">
                    Thank you for helping improve this event. Your insights make
                    a difference.
                  </p>
                  <Button
                    onClick={() => setSubmitted(false)}
                    variant="outline"
                    size="sm"
                  >
                    Submit Another
                  </Button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onSubmit={handleSubmit}
                  className="glass rounded-2xl p-6 space-y-5"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="name" className="text-sm font-medium">
                        Your Name
                      </Label>
                      <Input
                        id="name"
                        data-ocid="feedback.name.input"
                        placeholder="John Doe"
                        value={form.name}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, name: e.target.value }))
                        }
                        className="bg-muted/30 border-border/60 focus:border-primary/60"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-sm font-medium">
                        Email
                      </Label>
                      <Input
                        id="email"
                        data-ocid="feedback.email.input"
                        type="email"
                        placeholder="john@example.com"
                        value={form.email}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, email: e.target.value }))
                        }
                        className="bg-muted/30 border-border/60 focus:border-primary/60"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Overall Rating <span className="text-destructive">*</span>
                    </Label>
                    <div data-ocid="feedback.overall_rating.toggle">
                      <StarRating
                        value={form.overallRating}
                        onChange={(r) =>
                          setForm((p) => ({ ...p, overallRating: r }))
                        }
                        size="lg"
                        showValue
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { key: "contentRating", label: "Content Quality" },
                      { key: "organizationRating", label: "Organization" },
                      { key: "venueRating", label: "Venue / Platform" },
                    ].map((dim) => (
                      <div key={dim.key} className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground">
                          {dim.label}
                        </Label>
                        <StarRating
                          value={form[dim.key as keyof typeof form] as number}
                          onChange={(r) =>
                            setForm((p) => ({ ...p, [dim.key]: r }))
                          }
                          size="sm"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="comment" className="text-sm font-medium">
                      Your Comments
                    </Label>
                    <Textarea
                      id="comment"
                      data-ocid="feedback.comment.textarea"
                      placeholder="Share what you loved, what could be improved, and your overall experience..."
                      value={form.comment}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, comment: e.target.value }))
                      }
                      className="bg-muted/30 border-border/60 focus:border-primary/60 min-h-[100px] resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-border/50">
                    <div>
                      <p className="text-sm font-medium">
                        Would you recommend this event?
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Help others decide whether to attend
                      </p>
                    </div>
                    <Switch
                      data-ocid="feedback.recommend.switch"
                      checked={form.wouldRecommend}
                      onCheckedChange={(v) =>
                        setForm((p) => ({ ...p, wouldRecommend: v }))
                      }
                    />
                  </div>

                  {error && (
                    <div
                      data-ocid="feedback.error_state"
                      className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2"
                    >
                      <AlertCircle size={14} />
                      {error}
                    </div>
                  )}

                  <Button
                    data-ocid="feedback.submit_button"
                    type="submit"
                    disabled={submitMutation.isPending}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 glow-teal font-semibold"
                  >
                    {submitMutation.isPending ? (
                      <>
                        <Loader2
                          size={15}
                          className="mr-2 animate-spin"
                          data-ocid="feedback.loading_state"
                        />
                        Submitting...
                      </>
                    ) : (
                      "Submit Feedback"
                    )}
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* Feedback List */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-2xl">Reviews</h2>
              {feedbackList && feedbackList.length > 0 && (
                <Badge variant="secondary">
                  {feedbackList.length} review
                  {feedbackList.length !== 1 ? "s" : ""}
                </Badge>
              )}
            </div>

            {feedbackLoading ? (
              <div className="space-y-4">
                {["s1", "s2", "s3"].map((sk) => (
                  <Skeleton key={sk} className="h-32 w-full rounded-xl" />
                ))}
              </div>
            ) : feedbackList && feedbackList.length > 0 ? (
              <div className="space-y-4 max-h-[600px] overflow-y-auto scrollbar-thin pr-1">
                {feedbackList.map((fb, i) => (
                  <FeedbackCard
                    key={fb.id.toString()}
                    feedback={fb}
                    index={i}
                  />
                ))}
              </div>
            ) : (
              <div
                data-ocid="feedback.empty_state"
                className="glass rounded-xl p-10 text-center"
              >
                <User
                  size={36}
                  className="mx-auto mb-3 text-muted-foreground opacity-40"
                />
                <p className="text-muted-foreground text-sm">
                  No reviews yet. Be the first to share your experience!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
