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
});

export default mongoose.model<IArchivedPatient>(
  "ArchivedPatient",
  ArchivedPatientSchema,
  "archived_patients",
);
