import mongoose, { Document, Schema } from "mongoose";

export interface IDevice extends Document {
  id_device: string;
  room: number;
  id_patient: string;
  battery_level: number;
  help_needed: boolean;
  alert: mongoose.Types.ObjectId;
}

const DeviceSchema = new Schema<IDevice>({
  id_device: { type: String, required: true, unique: true },
  room: { type: Number, required: false },
  id_patient: { type: String, required: false },
  battery_level: { type: Number, required: false },
  help_needed: { type: Boolean, required: false },
  alert: { type: Schema.Types.ObjectId, ref: "Alert" },
});

export const Device = mongoose.model<IDevice>("Device", DeviceSchema);
