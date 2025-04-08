import mongoose, { Document, Schema } from "mongoose";

export interface IDevice extends Document {
  id_device: string;
  id_gateway: string;
  id_patient: string;
  battery_level: number;
  help_needed: boolean;
  alert: mongoose.Types.ObjectId;
}

const DeviceSchema = new Schema<IDevice>({
  id_device: { type: String, required: true, unique: true },
  id_gateway: { type: String, required: true },
  id_patient: { type: String, required: true },
  battery_level: { type: Number, required: true },
  help_needed: { type: Boolean, required: true },
  alert: { type: Schema.Types.ObjectId, ref: "Alert" },
});

export const Device = mongoose.model<IDevice>("Device", DeviceSchema);
