import mongoose, { Document, Schema } from 'mongoose';

export interface IRoom extends Document {
  name: string;
  patient: {
    name: string;
    id: string;
  };
}

const RoomSchema = new Schema<IRoom>(
  {
    name: { type: String, required: true },
    patient: {
      name: { type: String, required: true },
      id: { type: String, required: true },
    },
  },
  { timestamps: true }
);

export default mongoose.model<IRoom>('Room', RoomSchema);
