import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Event {
    id: bigint;
    title: string;
    date: string;
    createdAt: bigint;
    description: string;
    isActive: boolean;
    imageUrl: string;
    category: string;
    location: string;
}
export interface OverallStats {
    avgOverallRating: number;
    totalEvents: bigint;
    recommendRate: number;
    totalFeedback: bigint;
}
export interface EventStats {
    avgOrganizationRating: number;
    avgOverallRating: number;
    totalCount: bigint;
    avgContentRating: number;
    recommendRate: number;
    avgVenueRating: number;
}
export interface UserProfile {
    name: string;
}
export interface Feedback {
    id: bigint;
    eventId: bigint;
    submitterName: string;
    submittedAt: bigint;
    venueRating: bigint;
    comment: string;
    organizationRating: bigint;
    overallRating: bigint;
    contentRating: bigint;
    submitterEmail: string;
    wouldRecommend: boolean;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createEvent(title: string, description: string, date: string, location: string, category: string, imageUrl: string, isActive: boolean): Promise<void>;
    deleteEvent(id: bigint): Promise<void>;
    deleteFeedback(id: bigint): Promise<void>;
    getActiveEvents(): Promise<Array<Event>>;
    getAllEvents(): Promise<Array<Event>>;
    getAllFeedback(): Promise<Array<Feedback>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getEvent(id: bigint): Promise<Event>;
    getEventStats(eventId: bigint): Promise<EventStats>;
    getFeedbackByEvent(eventId: bigint): Promise<Array<Feedback>>;
    getOverallStats(): Promise<OverallStats>;
    getRecentFeedback(limit: bigint): Promise<Array<Feedback>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitFeedback(eventId: bigint, submitterName: string, submitterEmail: string, overallRating: bigint, contentRating: bigint, organizationRating: bigint, venueRating: bigint, comment: string, wouldRecommend: boolean): Promise<void>;
    updateEvent(id: bigint, title: string, description: string, date: string, location: string, category: string, imageUrl: string, isActive: boolean): Promise<void>;
    verifyAdminPin(pin: string): Promise<boolean>;
}
