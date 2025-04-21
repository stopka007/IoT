import mongoose, { Document, Schema } from "mongoose";

/**
 * Interface representing a Room document in MongoDB
 */
export interface IRoom extends Document {
  name: string;
  patient: {
    name: string;
    id: string;
  };
  isActive?: boolean;
  capacity?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const RoomSchema = new Schema<IRoom>(
  {
    name: {
      type: String,
      required: [true, "Room name is required"],
      trim: true,
      maxlength: [100, "Room name cannot be more than 100 characters"],
    },
    patient: {
      name: {
        type: String,
        required: [true, "Patient name is required"],
        trim: true,
        maxlength: [100, "Patient name cannot be more than 100 characters"],
      },
      id: {
        type: String,
        required: [true, "Patient ID is required"],
        trim: true,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    capacity: {
      type: Number,
      default: 1,
      min: [1, "Capacity must be at least 1"],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  },
);

// Create indexes for efficient querying
RoomSchema.index({ name: 1 });
RoomSchema.index({ "patient.name": 1 });
RoomSchema.index({ "patient.id": 1 });
RoomSchema.index({ isActive: 1 });

export default mongoose.model<IRoom>("Room", RoomSchema);
