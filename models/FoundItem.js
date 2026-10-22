const mongoose = require("mongoose");

const foundItemSchema = new mongoose.Schema({
  itemName: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  foundLocation: { type: String, required: true, trim: true },
  dateFound: { type: Date, required: true },
  status: { type: String, enum: ["Available", "Returned"], default: "Available" },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("FoundItem", foundItemSchema);