import mongoose, { Document, Schema } from "mongoose";

export interface IAlert extends Document {
  id_device: string;
  timestamp: Date;
  status: "open" | "resolved";
  history: { status: string; timestamp: Date }[];
  patient_name?: string;
  patient_id?: string;
}

const AlertSchema: Schema = new Schema({
  id_device: { type: String, required: true, ref: "Device" },
  timestamp: { type: Date, default: Date.now },
  status: { type: String, enum: ["open", "resolved"], default: "open" },
  history: [
    {
      status: { type: String, enum: ["open", "resolved"], required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
  patient_name: { type: String },
  patient_id: { type: String },
});

AlertSchema.pre<IAlert>("save", function (next) {
  if (this.isModified("status") && this.status === "resolved" && this.history.length === 0) {
    this.history.push({ status: "open", timestamp: this.timestamp }); // Log the original creation status
  } else if (this.isModified("status")) {
    this.history.push({ status: this.status, timestamp: new Date() }); // Log status change to resolved
  }
  next();
});

export default mongoose.model<IAlert>("Alert", AlertSchema);
