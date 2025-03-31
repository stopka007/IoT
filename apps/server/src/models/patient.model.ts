import mongoose, { Schema, Document } from 'mongoose';

export interface IPatient extends Document {
  id_patient: string;
  id_device: string;
  name: string;
  room: number;
}

const PatientSchema: Schema = new Schema({
  id_patient: { type: String, required: true },
  id_device: { type: String, required: true },
  name: { type: String, required: true },
  room: { type: Number, required: true },
});

export default mongoose.model<IPatient>('Patient', PatientSchema);
