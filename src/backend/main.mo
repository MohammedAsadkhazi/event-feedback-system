import Array "mo:core/Array";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Float "mo:core/Float";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User profiles
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Event Feedback System
  let events = Map.empty<Nat, Event>();
  let feedback = Map.empty<Nat, Feedback>();

  var nextEventId = 1;
  var nextFeedbackId = 1;
  var adminPin = "admin1234";
  var pinAttempts = 0;
  var pinLockoutUntil : ?Int = null;

  public type Event = {
    id : Nat;
    title : Text;
    description : Text;
    date : Text;
    location : Text;
    category : Text;
    imageUrl : Text;
    isActive : Bool;
    createdAt : Int;
  };

  public type Feedback = {
    id : Nat;
    eventId : Nat;
    submitterName : Text;
    submitterEmail : Text;
    overallRating : Nat;
    contentRating : Nat;
    organizationRating : Nat;
    venueRating : Nat;
    comment : Text;
    wouldRecommend : Bool;
    submittedAt : Int;
  };

  public type EventStats = {
    avgOverallRating : Float;
    avgContentRating : Float;
    avgOrganizationRating : Float;
    avgVenueRating : Float;
    totalCount : Nat;
    recommendRate : Float;
  };

  public type OverallStats = {
    totalEvents : Nat;
    totalFeedback : Nat;
    avgOverallRating : Float;
    recommendRate : Float;
  };

  // Admin PIN verification - public but with rate limiting
  public query ({ caller }) func verifyAdminPin(pin : Text) : async Bool {
    let now = Time.now();
    switch (pinLockoutUntil) {
      case (?until) {
        if (now <= until and pin != adminPin) {
          return false;
        };
      };
      case (null) {};
    };
    if (pin == adminPin) {
      pinAttempts := 0;
      pinLockoutUntil := null;
      return true;
    } else {
      pinAttempts += 1;
      if (pinAttempts >= 3) {
        pinLockoutUntil := ?(now + 60000000000);
        pinAttempts := 0;
      };
      return false;
    };
  };

  // Create event (PIN-gated on frontend)
  public shared ({ caller }) func createEvent(title : Text, description : Text, date : Text, location : Text, category : Text, imageUrl : Text, isActive : Bool) : async () {
    let event : Event = {
      id = nextEventId;
      title;
      description;
      date;
      location;
      category;
      imageUrl;
      isActive;
      createdAt = Time.now();
    };
    events.add(nextEventId, event);
    nextEventId += 1;
  };

  // Update event (PIN-gated on frontend)
  public shared ({ caller }) func updateEvent(id : Nat, title : Text, description : Text, date : Text, location : Text, category : Text, imageUrl : Text, isActive : Bool) : async () {
    let existing = switch (events.get(id)) {
      case (null) { Runtime.trap("Event not found") };
      case (?event) { event };
    };
    let updated : Event = {
      id;
      title;
      description;
      date;
      location;
      category;
      imageUrl;
      isActive;
      createdAt = existing.createdAt;
    };
    events.add(id, updated);
  };

  // Delete event (PIN-gated on frontend)
  public shared ({ caller }) func deleteEvent(id : Nat) : async () {
    if (not events.containsKey(id)) {
      Runtime.trap("Event not found");
    };
    events.remove(id);
  };

  // PUBLIC: Get single event
  public query ({ caller }) func getEvent(id : Nat) : async Event {
    switch (events.get(id)) {
      case (null) { Runtime.trap("Event not found") };
      case (?event) { event };
    };
  };

  // PUBLIC: Get all events
  public query ({ caller }) func getAllEvents() : async [Event] {
    let eventsArray = events.values().toArray();
    eventsArray.sort(func(a : Event, b : Event) : Order.Order {
      Nat.compare(a.id, b.id)
    });
  };

  // PUBLIC: Get active events
  public query ({ caller }) func getActiveEvents() : async [Event] {
    let eventsArray = events.values().toArray();
    let sorted = eventsArray.sort(func(a : Event, b : Event) : Order.Order {
      Nat.compare(a.id, b.id)
    });
    sorted.filter(func(event : Event) : Bool { event.isActive });
  };

  // PUBLIC: Submit feedback (any user including guests)
  public shared ({ caller }) func submitFeedback(eventId : Nat, submitterName : Text, submitterEmail : Text, overallRating : Nat, contentRating : Nat, organizationRating : Nat, venueRating : Nat, comment : Text, wouldRecommend : Bool) : async () {
    if (overallRating < 1 or overallRating > 5 or
        contentRating < 1 or contentRating > 5 or
        organizationRating < 1 or organizationRating > 5 or
        venueRating < 1 or venueRating > 5) {
      Runtime.trap("Ratings must be between 1 and 5");
    };
    
    switch (events.get(eventId)) {
      case (null) { Runtime.trap("Event not found") };
      case (?_) {};
    };

    let fb : Feedback = {
      id = nextFeedbackId;
      eventId;
      submitterName;
      submitterEmail;
      overallRating;
      contentRating;
      organizationRating;
      venueRating;
      comment;
      wouldRecommend;
      submittedAt = Time.now();
    };
    feedback.add(nextFeedbackId, fb);
    nextFeedbackId += 1;
  };

  // PUBLIC: Get feedback by event
  public query ({ caller }) func getFeedbackByEvent(eventId : Nat) : async [Feedback] {
    let feedbackArray = feedback.values().toArray();
    let filtered = feedbackArray.filter(func(fb : Feedback) : Bool { fb.eventId == eventId });
    filtered.sort(func(a : Feedback, b : Feedback) : Order.Order {
      Nat.compare(b.id, a.id)
    });
  };

  // PUBLIC: Get all feedback
  public query ({ caller }) func getAllFeedback() : async [Feedback] {
    let feedbackArray = feedback.values().toArray();
    feedbackArray.sort(func(a : Feedback, b : Feedback) : Order.Order {
      Nat.compare(b.id, a.id)
    });
  };

  // Delete feedback (PIN-gated on frontend)
  public shared ({ caller }) func deleteFeedback(id : Nat) : async () {
    if (not feedback.containsKey(id)) {
      Runtime.trap("Feedback not found");
    };
    feedback.remove(id);
  };

  // PUBLIC: Get recent feedback
  public query ({ caller }) func getRecentFeedback(limit : Nat) : async [Feedback] {
    let feedbackArray = feedback.values().toArray();
    let sorted = feedbackArray.sort(func(a : Feedback, b : Feedback) : Order.Order {
      Nat.compare(b.id, a.id)
    });
    if (sorted.size() <= limit) { 
      return sorted;
    };
    Array.tabulate(limit, func(i : Nat) : Feedback { sorted[i] });
  };

  // PUBLIC: Get event statistics
  public query ({ caller }) func getEventStats(eventId : Nat) : async EventStats {
    let allFeedback = feedback.values().toArray();
    let eventFeedback = allFeedback.filter(func(fb : Feedback) : Bool { fb.eventId == eventId });
    
    if (eventFeedback.size() == 0) {
      return {
        avgOverallRating = 0.0;
        avgContentRating = 0.0;
        avgOrganizationRating = 0.0;
        avgVenueRating = 0.0;
        totalCount = 0;
        recommendRate = 0.0;
      };
    };

    let total = eventFeedback.size();
    var sumOverall = 0;
    var sumContent = 0;
    var sumOrg = 0;
    var sumVenue = 0;
    var sumRecommend = 0;

    for (fb in eventFeedback.vals()) {
      sumOverall += fb.overallRating;
      sumContent += fb.contentRating;
      sumOrg += fb.organizationRating;
      sumVenue += fb.venueRating;
      if (fb.wouldRecommend) {
        sumRecommend += 1;
      };
    };

    {
      avgOverallRating = sumOverall.toFloat() / total.toFloat();
      avgContentRating = sumContent.toFloat() / total.toFloat();
      avgOrganizationRating = sumOrg.toFloat() / total.toFloat();
      avgVenueRating = sumVenue.toFloat() / total.toFloat();
      totalCount = total;
      recommendRate = sumRecommend.toFloat() / total.toFloat();
    };
  };

  // PUBLIC: Get overall statistics
  public query ({ caller }) func getOverallStats() : async OverallStats {
    let totalEvents = events.size();
    let allFeedback = feedback.values().toArray();
    let totalFeedback = allFeedback.size();

    if (totalFeedback == 0) {
      return {
        totalEvents;
        totalFeedback;
        avgOverallRating = 0.0;
        recommendRate = 0.0;
      };
    };

    let total = totalFeedback;
    var sumOverall = 0;
    var sumRecommend = 0;

    for (fb in allFeedback.vals()) {
      sumOverall += fb.overallRating;
      if (fb.wouldRecommend) {
        sumRecommend += 1;
      };
    };

    {
      totalEvents;
      totalFeedback;
      avgOverallRating = sumOverall.toFloat() / total.toFloat();
      recommendRate = sumRecommend.toFloat() / total.toFloat();
    };
  };
};
