import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  coordinators: defineTable({
    empId: v.string(),
    name: v.string(),
    department: v.string(),
    signature: v.string(),
  }),
  venues: defineTable({
    name: v.string(),
  }),
  eventTypes: defineTable({
    name: v.string(),
  }),
  reports: defineTable({
    title: v.string(),
    type: v.string(),
    date: v.string(),
    fileName: v.string(),
    fileData: v.string(),
    uploadedAt: v.string(),
  }),
});
