import mongoose, { Document, Schema } from "mongoose";

export interface IAlert extends Document {
  id_device: string;
  timestamp: Date;
  status: "open" | "resolved";
}

const AlertSchema: Schema = new Schema({
  id_device: { type: String, required: true, ref: "Device" },
  timestamp: { type: Date, default: Date.now },
  status: { type: String, enum: ["open", "resolved"], default: "open" },
});

export default mongoose.model<IAlert>("Alert", AlertSchema);
