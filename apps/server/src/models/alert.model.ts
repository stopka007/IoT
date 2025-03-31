import mongoose, { Document, Schema } from "mongoose";

export interface IAlert extends Document {
  id_patient: string;
  timestamp: Date;
  status: "open" | "resolved";
  message: string;
}

const AlertSchema: Schema = new Schema({
  id_patient: { type: String, required: true, ref: "Patient" },
  timestamp: { type: Date, default: Date.now },
  status: { type: String, enum: ["open", "resolved"], default: "open" },
  message: { type: String, required: true },
});

export default mongoose.model<IAlert>("Alert", AlertSchema);
