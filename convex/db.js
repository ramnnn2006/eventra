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
