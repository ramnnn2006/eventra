import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Coordinators
export const getCoordinators = query({
  handler: async (ctx) => {
    return await ctx.db.query("coordinators").collect();
  },
});

export const addCoordinator = mutation({
  args: {
    empId: v.string(),
    name: v.string(),
    department: v.string(),
    signature: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("coordinators", {
      empId: args.empId,
      name: args.name,
      department: args.department,
      signature: args.signature,
    });
  },
});

export const removeCoordinator = mutation({
  args: { id: v.id("coordinators") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Venues
export const getVenues = query({
  handler: async (ctx) => {
    return await ctx.db.query("venues").collect();
  },
});

export const addVenue = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.insert("venues", { name: args.name });
  },
});

export const removeVenue = mutation({
  args: { id: v.id("venues") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Event Types
export const getEventTypes = query({
  handler: async (ctx) => {
    return await ctx.db.query("eventTypes").collect();
  },
});

export const addEventType = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.insert("eventTypes", { name: args.name });
  },
});

export const removeEventType = mutation({
  args: { id: v.id("eventTypes") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Reports
export const getReports = query({
  handler: async (ctx) => {
    return await ctx.db.query("reports").collect();
  },
});

export const addReport = mutation({
  args: {
    title: v.string(),
    type: v.string(),
    date: v.string(),
    fileName: v.string(),
    fileData: v.string(),
    uploadedAt: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("reports", {
      title: args.title,
      type: args.type,
      date: args.date,
      fileName: args.fileName,
      fileData: args.fileData,
      uploadedAt: args.uploadedAt,
    });
  },
});

export const removeReport = mutation({
  args: { id: v.id("reports") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Logos
export const getLogos = query({
  handler: async (ctx) => {
    return await ctx.db.query("logos").collect();
  },
});

export const addLogo = mutation({
  args: {
    id: v.string(),
    name: v.string(),
    isOptional: v.boolean(),
    src: v.optional(v.string()),
    dataUrl: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("logos", {
      id: args.id,
      name: args.name,
      isOptional: args.isOptional,
      src: args.src,
      dataUrl: args.dataUrl,
    });
  },
});

export const removeLogo = mutation({
  args: { id: v.id("logos") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const updateLogo = mutation({
  args: {
    id: v.id("logos"),
    dataUrl: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { dataUrl: args.dataUrl });
  },
});

// Custom Template
export const getCustomTemplate = query({
  handler: async (ctx) => {
    const template = await ctx.db.query("customTemplate").first();
    return template?.templateData || null;
  },
});

export const setCustomTemplate = mutation({
  args: { templateData: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("customTemplate").first();
    if (existing) {
      await ctx.db.patch(existing._id, { templateData: args.templateData });
    } else {
      await ctx.db.insert("customTemplate", { templateData: args.templateData });
    }
  },
});

// User Settings
export const getUserSettings = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query("userSettings")
      .withIndex("byUserId", (q) => q.eq("userId", args.userId))
      .first();
    return settings;
  },
});

export const setUserSettings = mutation({
  args: {
    userId: v.string(),
    theme: v.string(),
    accent: v.object({
      name: v.string(),
      h: v.number(),
      s: v.number(),
      l: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userSettings")
      .withIndex("byUserId", (q) => q.eq("userId", args.userId))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, {
        theme: args.theme,
        accent: args.accent,
      });
    } else {
      await ctx.db.insert("userSettings", {
        userId: args.userId,
        theme: args.theme,
        accent: args.accent,
      });
    }
  },
});

// Initialize default data
export const initializeDefaults = mutation({
  handler: async (ctx) => {
    // Check if coordinators exist
    const coordinators = await ctx.db.query("coordinators").collect();
    if (coordinators.length === 0) {
      await ctx.db.insert("coordinators", {
        empId: "50930",
        name: "Dr Anusha K",
        department: "SCOPE",
        signature: "",
      });
      await ctx.db.insert("coordinators", {
        empId: "51327",
        name: "Dr Braveen M",
        department: "SCOPE",
        signature: "",
      });
    }

    // Check if venues exist
    const venues = await ctx.db.query("venues").collect();
    if (venues.length === 0) {
      const defaultVenues = [
        "MG Auditorium",
        "Kasturba Auditorium",
        "Kamaraj Auditorium",
        "Netaji Auditorium",
        "VOC Auditorium",
        "Classroom",
        "Online",
        "Other",
      ];
      for (const venue of defaultVenues) {
        await ctx.db.insert("venues", { name: venue });
      }
    }

    // Check if event types exist
    const eventTypes = await ctx.db.query("eventTypes").collect();
    if (eventTypes.length === 0) {
      const defaultTypes = [
        "Workshop",
        "Online Workshop",
        "Hackathon",
        "Competition",
        "Guest Lecture",
        "Seminar",
        "Symposium",
        "Conference",
        "Value Added Session",
        "Training Program",
        "Other",
      ];
      for (const type of defaultTypes) {
        await ctx.db.insert("eventTypes", { name: type });
      }
    }

    // Check if logos exist
    const logos = await ctx.db.query("logos").collect();
    if (logos.length === 0) {
      const defaultLogos = [
        { id: "vitc", name: "VIT Chennai", isOptional: false, src: "/vitclogo.png", dataUrl: "" },
        { id: "mic", name: "Microsoft Innovations Club", isOptional: false, src: "/miclogo.png", dataUrl: "" },
        { id: "swc", name: "Student Welfare", isOptional: false, src: "/swc.png", dataUrl: "" },
        { id: "iic", name: "IIC", isOptional: true, src: "/iic.png", dataUrl: "" },
        { id: "mlsa", name: "MLSA", isOptional: true, src: "/mlsa.png", dataUrl: "" },
        { id: "vnest", name: "VNEST", isOptional: true, src: "/vnest.png", dataUrl: "" },
      ];
      for (const logo of defaultLogos) {
        await ctx.db.insert("logos", logo);
      }
    }
  },
});
