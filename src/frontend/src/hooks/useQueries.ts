import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Event, EventStats, Feedback, OverallStats } from "../backend.d";
import { useActor } from "./useActor";

export function useGetAllEvents() {
  const { actor, isFetching } = useActor();
  return useQuery<Event[]>({
    queryKey: ["events", "all"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllEvents();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetActiveEvents() {
  const { actor, isFetching } = useActor();
  return useQuery<Event[]>({
    queryKey: ["events", "active"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getActiveEvents();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetEvent(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Event | null>({
    queryKey: ["events", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getEvent(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useGetFeedbackByEvent(eventId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Feedback[]>({
    queryKey: ["feedback", "event", eventId?.toString()],
    queryFn: async () => {
      if (!actor || eventId === null) return [];
      return actor.getFeedbackByEvent(eventId);
    },
    enabled: !!actor && !isFetching && eventId !== null,
  });
}

export function useGetAllFeedback() {
  const { actor, isFetching } = useActor();
  return useQuery<Feedback[]>({
    queryKey: ["feedback", "all"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllFeedback();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetEventStats(eventId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<EventStats | null>({
    queryKey: ["stats", "event", eventId?.toString()],
    queryFn: async () => {
      if (!actor || eventId === null) return null;
      return actor.getEventStats(eventId);
    },
    enabled: !!actor && !isFetching && eventId !== null,
  });
}

export function useGetOverallStats() {
  const { actor, isFetching } = useActor();
  return useQuery<OverallStats | null>({
    queryKey: ["stats", "overall"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getOverallStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetRecentFeedback(limit: number) {
  const { actor, isFetching } = useActor();
  return useQuery<Feedback[]>({
    queryKey: ["feedback", "recent", limit],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getRecentFeedback(BigInt(limit));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubmitFeedback() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      eventId: bigint;
      submitterName: string;
      submitterEmail: string;
      overallRating: number;
      contentRating: number;
      organizationRating: number;
      venueRating: number;
      comment: string;
      wouldRecommend: boolean;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.submitFeedback(
        data.eventId,
        data.submitterName,
        data.submitterEmail,
        BigInt(data.overallRating),
        BigInt(data.contentRating),
        BigInt(data.organizationRating),
        BigInt(data.venueRating),
        data.comment,
        data.wouldRecommend,
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["feedback", "event", variables.eventId.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["feedback", "all"] });
      queryClient.invalidateQueries({
        queryKey: ["stats", "event", variables.eventId.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["stats", "overall"] });
    },
  });
}

export function useCreateEvent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
      date: string;
      location: string;
      category: string;
      imageUrl: string;
      isActive: boolean;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createEvent(
        data.title,
        data.description,
        data.date,
        data.location,
        data.category,
        data.imageUrl,
        data.isActive,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useUpdateEvent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      title: string;
      description: string;
      date: string;
      location: string;
      category: string;
      imageUrl: string;
      isActive: boolean;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateEvent(
        data.id,
        data.title,
        data.description,
        data.date,
        data.location,
        data.category,
        data.imageUrl,
        data.isActive,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useDeleteEvent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteEvent(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["feedback"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useDeleteFeedback() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteFeedback(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedback"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useVerifyAdminPin() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (pin: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.verifyAdminPin(pin);
    },
  });
}
