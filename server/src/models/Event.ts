import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    session_id: { type: String, required: true, index: true },
    type: { type: String, required: true, enum: ["page_view", "click"] },
    page_url: { type: String, required: true, index: true },
    timestamp: { type: Date, required: true },
    x: { type: Number, default: null },
    y: { type: Number, default: null },
    document_width: { type: Number, default: null },
    document_height: { type: Number, default: null },
    createdAt: { type: Date, default: () => new Date() },
  },
  { collection: "events" }
);

eventSchema.index({ session_id: 1, timestamp: 1 });
eventSchema.index({ type: 1, page_url: 1 });

export const Event = mongoose.model("Event", eventSchema);
