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
  logos: defineTable({
    id: v.string(),
    name: v.string(),
    isOptional: v.boolean(),
    src: v.optional(v.string()),
    dataUrl: v.string(),
  }).index("byId", ["id"]),
  customTemplate: defineTable({
    templateData: v.string(),
  }),
  userSettings: defineTable({
    userId: v.string(),
    theme: v.string(),
    accent: v.object({
      name: v.string(),
      h: v.number(),
      s: v.number(),
      l: v.number(),
    }),
  }).index("byUserId", ["userId"]),
});
