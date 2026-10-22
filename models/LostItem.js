const mongoose = require("mongoose");

const lostItemSchema = new mongoose.Schema({
  itemName: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  lastSeenLocation: { type: String, required: true, trim: true },
  dateLost: { type: Date, required: true },
  status: { type: String, enum: ["Lost", "Found"], default: "Lost" },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("LostItem", lostItemSchema);