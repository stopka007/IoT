import mongoose, { Document, Schema } from "mongoose";

export interface IArchivedPatient extends Document {
  id_patient: string;
  id_device: string;
  name: string;
  room: number;
  illness?: string;
  age?: number;
  status?: string;
  notes?: string;
  createdAt?: Date;
  archivedAt?: Date;
}

const ArchivedPatientSchema: Schema = new Schema({
  id_patient: { type: String, required: false },
  id_device: { type: String, required: false },
  name: { type: String, required: true },
  room: { type: Number, required: false },
  illness: { type: String, required: false },
  age: { type: Number, required: false },
  notes: { type: String, required: false },
  status: { type: String, required: false },
  createdAt: { type: Date, required: false, default: Date.now },
  archivedAt: { type: Date, required: false },
});

export default mongoose.model<IArchivedPatient>(
  "ArchivedPatient",
  ArchivedPatientSchema,
  "archived_patients",
);
