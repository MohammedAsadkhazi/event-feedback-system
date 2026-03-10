import { DisplayStars } from "@/components/StarRating";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateEvent,
  useDeleteEvent,
  useDeleteFeedback,
  useGetAllEvents,
  useGetAllFeedback,
  useGetOverallStats,
  useGetRecentFeedback,
  useUpdateEvent,
  useVerifyAdminPin,
} from "@/hooks/useQueries";
import {
  AlertCircle,
  Calendar,
  Edit2,
  Loader2,
  Lock,
  MessageSquare,
  Plus,
  ShieldCheck,
  Star,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Event } from "../backend.d";

const CATEGORIES = [
  "Technology",
  "Music",
  "Business",
  "Arts",
  "Sports",
  "Education",
  "Other",
];

const EMPTY_FORM = {
  title: "",
  description: "",
  date: "",
  location: "",
  category: "Technology",
  imageUrl: "",
  isActive: true,
};

const statCards = [
  {
    label: "Total Events",
    icon: Calendar,
    color: "text-primary",
    bg: "bg-primary/15",
    key: "totalEvents",
  },
  {
    label: "Total Feedback",
    icon: MessageSquare,
    color: "text-purple-400",
    bg: "bg-purple-500/15",
    key: "totalFeedback",
  },
  {
    label: "Avg Rating",
    icon: Star,
    color: "text-accent",
    bg: "bg-accent/15",
    key: "avgRating",
  },
  {
    label: "Recommend Rate",
    icon: TrendingUp,
    color: "text-green-400",
    bg: "bg-green-500/15",
    key: "recommendRate",
  },
];

// PIN Login Screen
function PinLogin({ onSuccess }: { onSuccess: () => void }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const verifyMutation = useVerifyAdminPin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!pin.trim()) {
      setError("Please enter a PIN.");
      return;
    }
    try {
      const valid = await verifyMutation.mutateAsync(pin);
      if (valid) {
        onSuccess();
      } else {
        setError("Incorrect PIN. Please try again.");
        setPin("");
      }
    } catch {
      setError("Verification failed. Please try again.");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        <div className="glass rounded-2xl p-8 border border-border/60">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center mx-auto mb-4 glow-teal">
              <Lock size={24} className="text-primary" />
            </div>
            <h1 className="font-display font-bold text-2xl mb-1">
              Admin Access
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your PIN to access the dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="pin" className="text-sm font-medium">
                Admin PIN
              </Label>
              <Input
                id="pin"
                data-ocid="admin.pin.input"
                type="password"
                placeholder="Enter PIN..."
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="text-center text-xl tracking-widest bg-muted/30 border-border/60 focus:border-primary/60"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2">
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            <Button
              data-ocid="admin.pin.submit_button"
              type="submit"
              disabled={verifyMutation.isPending}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 glow-teal font-semibold"
            >
              {verifyMutation.isPending ? (
                <>
                  <Loader2 size={14} className="mr-2 animate-spin" />{" "}
                  Verifying...
                </>
              ) : (
                <>
                  <ShieldCheck size={14} className="mr-2" /> Access Dashboard
                </>
              )}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

// Event Form Modal
function EventFormModal({
  open,
  onClose,
  editEvent,
}: {
  open: boolean;
  onClose: () => void;
  editEvent?: Event | null;
}) {
  const [form, setForm] = useState(
    editEvent
      ? {
          title: editEvent.title,
          description: editEvent.description,
          date: editEvent.date,
          location: editEvent.location,
          category: editEvent.category,
          imageUrl: editEvent.imageUrl,
          isActive: editEvent.isActive,
        }
      : EMPTY_FORM,
  );

  const createMutation = useCreateEvent();
  const updateMutation = useUpdateEvent();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.date || !form.location) {
      toast.error("Please fill in all required fields.");
      return;
    }
    try {
      if (editEvent) {
        await updateMutation.mutateAsync({ id: editEvent.id, ...form });
        toast.success("Event updated successfully!");
      } else {
        await createMutation.mutateAsync(form);
        toast.success("Event created successfully!");
      }
      onClose();
    } catch {
      toast.error("Failed to save event.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        data-ocid="admin.event_form.dialog"
        className="glass border-border/60 max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {editEvent ? "Edit Event" : "Create New Event"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="Event title"
              value={form.title}
              onChange={(e) =>
                setForm((p) => ({ ...p, title: e.target.value }))
              }
              className="bg-muted/30 border-border/60"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Description</Label>
            <Textarea
              placeholder="Describe the event..."
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              className="bg-muted/30 border-border/60 resize-none min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                Date <span className="text-destructive">*</span>
              </Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((p) => ({ ...p, date: e.target.value }))
                }
                className="bg-muted/30 border-border/60"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}
              >
                <SelectTrigger className="bg-muted/30 border-border/60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">
              Location <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="Venue or online platform"
              value={form.location}
              onChange={(e) =>
                setForm((p) => ({ ...p, location: e.target.value }))
              }
              className="bg-muted/30 border-border/60"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Cover Image URL</Label>
            <Input
              placeholder="https://..."
              value={form.imageUrl}
              onChange={(e) =>
                setForm((p) => ({ ...p, imageUrl: e.target.value }))
              }
              className="bg-muted/30 border-border/60"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-border/50">
            <Label className="text-sm font-medium cursor-pointer">
              Active Event
            </Label>
            <Switch
              checked={form.isActive}
              onCheckedChange={(v) => setForm((p) => ({ ...p, isActive: v }))}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              data-ocid="admin.event_form.cancel_button"
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-border/60"
            >
              Cancel
            </Button>
            <Button
              data-ocid="admin.event_form.submit_button"
              type="submit"
              disabled={isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isPending ? (
                <>
                  <Loader2 size={14} className="mr-2 animate-spin" />
                  Saving...
                </>
              ) : editEvent ? (
                "Update Event"
              ) : (
                "Create Event"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Main Admin Dashboard
function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useGetOverallStats();
  const { data: events, isLoading: eventsLoading } = useGetAllEvents();
  const { data: allFeedback, isLoading: feedbackLoading } = useGetAllFeedback();
  const { data: recentFeedback } = useGetRecentFeedback(10);
  const deleteEventMutation = useDeleteEvent();
  const deleteFeedbackMutation = useDeleteFeedback();

  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [feedbackEventFilter, setFeedbackEventFilter] = useState("all");

  const handleDeleteEvent = async (id: bigint) => {
    if (!confirm("Delete this event and all its feedback?")) return;
    try {
      await deleteEventMutation.mutateAsync(id);
      toast.success("Event deleted.");
    } catch {
      toast.error("Failed to delete event.");
    }
  };

  const handleDeleteFeedback = async (id: bigint) => {
    if (!confirm("Delete this feedback?")) return;
    try {
      await deleteFeedbackMutation.mutateAsync(id);
      toast.success("Feedback deleted.");
    } catch {
      toast.error("Failed to delete feedback.");
    }
  };

  const filteredFeedback =
    feedbackEventFilter === "all"
      ? allFeedback || []
      : (allFeedback || []).filter(
          (f) => f.eventId.toString() === feedbackEventFilter,
        );

  const getEventTitle = (eventId: bigint) =>
    events?.find((e) => e.id.toString() === eventId.toString())?.title ||
    `Event #${eventId}`;

  const statValues = [
    stats ? Number(stats.totalEvents) : 0,
    stats ? Number(stats.totalFeedback) : 0,
    stats ? stats.avgOverallRating.toFixed(1) : "0.0",
    stats ? `${Math.round(stats.recommendRate * 100)}%` : "0%",
  ];

  return (
    <div className="container mx-auto px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-1">
          <ShieldCheck size={20} className="text-primary" />
          <p className="text-primary text-sm font-medium uppercase tracking-widest">
            Admin Dashboard
          </p>
        </div>
        <h1 className="font-display font-extrabold text-4xl">
          Event Management
        </h1>
      </motion.div>

      <Tabs defaultValue="overview">
        <TabsList className="bg-card/50 border border-border/60 mb-8">
          <TabsTrigger
            data-ocid="admin.overview.tab"
            value="overview"
            className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            data-ocid="admin.events.tab"
            value="events"
            className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
          >
            Events
          </TabsTrigger>
          <TabsTrigger
            data-ocid="admin.feedback.tab"
            value="feedback"
            className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
          >
            Feedback
          </TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statsLoading
              ? ["s1", "s2", "s3", "s4"].map((sk) => (
                  <Skeleton key={sk} className="h-28 rounded-xl" />
                ))
              : statCards.map((card, i) => (
                  <motion.div
                    key={card.key}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="glass rounded-xl p-5 flex items-center gap-4"
                  >
                    <div
                      className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center flex-shrink-0`}
                    >
                      <card.icon size={20} className={card.color} />
                    </div>
                    <div>
                      <div
                        className={`text-2xl font-display font-bold ${card.color}`}
                      >
                        {statValues[i]}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {card.label}
                      </div>
                    </div>
                  </motion.div>
                ))}
          </div>

          <div>
            <h3 className="font-display font-semibold text-lg mb-4">
              Recent Feedback
            </h3>
            {recentFeedback && recentFeedback.length > 0 ? (
              <div className="glass rounded-xl overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50 hover:bg-transparent">
                      <TableHead className="text-muted-foreground">
                        Event
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Submitter
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Rating
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Comment
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentFeedback.slice(0, 5).map((fb) => (
                      <TableRow
                        key={fb.id.toString()}
                        className="border-border/30 hover:bg-muted/20"
                      >
                        <TableCell className="text-xs font-medium">
                          {getEventTitle(fb.eventId)}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {fb.submitterName}
                        </TableCell>
                        <TableCell>
                          <DisplayStars
                            rating={Number(fb.overallRating)}
                            size="sm"
                          />
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                          {fb.comment || "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="glass rounded-xl p-8 text-center text-muted-foreground text-sm">
                No feedback yet.
              </div>
            )}
          </div>
        </TabsContent>

        {/* EVENTS TAB */}
        <TabsContent value="events">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-semibold text-lg">
              All Events ({events?.length || 0})
            </h3>
            <Button
              data-ocid="admin.create_event.primary_button"
              onClick={() => {
                setEditingEvent(null);
                setShowEventModal(true);
              }}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus size={15} className="mr-1.5" /> Create Event
            </Button>
          </div>

          {eventsLoading ? (
            <div className="space-y-3">
              {["s1", "s2", "s3", "s4", "s5"].map((sk) => (
                <Skeleton key={sk} className="h-14 rounded-xl" />
              ))}
            </div>
          ) : events && events.length > 0 ? (
            <div className="glass rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableHead className="text-muted-foreground">
                      Title
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Category
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Date
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Location
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Status
                    </TableHead>
                    <TableHead className="text-muted-foreground text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => (
                    <TableRow
                      key={event.id.toString()}
                      className="border-border/30 hover:bg-muted/20"
                    >
                      <TableCell className="font-medium text-sm">
                        {event.title}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {event.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {event.date}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {event.location}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            event.isActive
                              ? "bg-green-500/20 text-green-300 border-green-500/30 text-xs"
                              : "bg-muted text-muted-foreground border-border text-xs"
                          }
                        >
                          {event.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-1.5 justify-end">
                          <Button
                            size="sm"
                            variant="ghost"
                            type="button"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            onClick={() => {
                              setEditingEvent(event);
                              setShowEventModal(true);
                            }}
                          >
                            <Edit2 size={13} />
                          </Button>
                          <Button
                            data-ocid="admin.delete_event.delete_button"
                            size="sm"
                            variant="ghost"
                            type="button"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteEvent(event.id)}
                          >
                            <Trash2 size={13} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div
              data-ocid="events.empty_state"
              className="glass rounded-xl p-12 text-center"
            >
              <Calendar
                size={40}
                className="mx-auto mb-3 text-muted-foreground opacity-30"
              />
              <p className="text-muted-foreground">
                No events yet. Create your first event!
              </p>
            </div>
          )}
        </TabsContent>

        {/* FEEDBACK TAB */}
        <TabsContent value="feedback">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <h3 className="font-display font-semibold text-lg">
              All Feedback ({allFeedback?.length || 0})
            </h3>
            <Select
              value={feedbackEventFilter}
              onValueChange={setFeedbackEventFilter}
            >
              <SelectTrigger className="w-52 bg-card/50 border-border/60">
                <SelectValue placeholder="Filter by event" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                {events?.map((e) => (
                  <SelectItem key={e.id.toString()} value={e.id.toString()}>
                    {e.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {feedbackLoading ? (
            <div className="space-y-3">
              {["s1", "s2", "s3", "s4", "s5"].map((sk) => (
                <Skeleton key={sk} className="h-14 rounded-xl" />
              ))}
            </div>
          ) : filteredFeedback.length > 0 ? (
            <div className="glass rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50 hover:bg-transparent">
                      <TableHead className="text-muted-foreground">
                        Event
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Submitter
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Overall
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Content
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Org
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Venue
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Comment
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Date
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Delete
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFeedback.map((fb) => (
                      <TableRow
                        key={fb.id.toString()}
                        className="border-border/30 hover:bg-muted/20"
                      >
                        <TableCell className="text-xs font-medium max-w-[120px] truncate">
                          {getEventTitle(fb.eventId)}
                        </TableCell>
                        <TableCell className="text-xs">
                          <div>{fb.submitterName}</div>
                          <div className="text-muted-foreground">
                            {fb.submitterEmail}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DisplayStars
                            rating={Number(fb.overallRating)}
                            size="sm"
                          />
                        </TableCell>
                        <TableCell className="text-xs text-center">
                          {Number(fb.contentRating)}/5
                        </TableCell>
                        <TableCell className="text-xs text-center">
                          {Number(fb.organizationRating)}/5
                        </TableCell>
                        <TableCell className="text-xs text-center">
                          {Number(fb.venueRating)}/5
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[160px] truncate">
                          {fb.comment || "—"}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(
                            Number(fb.submittedAt) / 1_000_000,
                          ).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            data-ocid="admin.delete_feedback.delete_button"
                            size="sm"
                            variant="ghost"
                            type="button"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteFeedback(fb.id)}
                          >
                            <Trash2 size={13} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <div
              data-ocid="feedback.empty_state"
              className="glass rounded-xl p-12 text-center"
            >
              <MessageSquare
                size={40}
                className="mx-auto mb-3 text-muted-foreground opacity-30"
              />
              <p className="text-muted-foreground">No feedback recorded yet.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <AnimatePresence>
        {showEventModal && (
          <EventFormModal
            open={showEventModal}
            onClose={() => {
              setShowEventModal(false);
              setEditingEvent(null);
            }}
            editEvent={editingEvent}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);

  return (
    <AnimatePresence mode="wait">
      {!authenticated ? (
        <motion.div
          key="login"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <PinLogin onSuccess={() => setAuthenticated(true)} />
        </motion.div>
      ) : (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <AdminDashboard />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
