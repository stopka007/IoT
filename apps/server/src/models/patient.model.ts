import { strict } from "assert";
import mongoose, { Document, Schema } from "mongoose";

export interface IPatient extends Document {
  id_patient: string;
  id_device: string;
  name: string;
  room: number;
  illness?: string;
  age?: number;
  notes?: string;
}

const PatientSchema: Schema = new Schema({
  id_patient: { type: String, required: false },
  id_device: { type: String, required: false },
  name: { type: String, required: true },
  room: { type: Number, required: false },
  illness: { type: String, required: false },
  age: { type: Number, required: false },
  notes: { type: String, required: false },
});

export default mongoose.model<IPatient>("Patient", PatientSchema);
