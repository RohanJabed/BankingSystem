import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAuditLogDocument extends Document {
  performedBy: mongoose.Types.ObjectId;
  action: string;
  targetModel: string;
  targetId: string;
  details: Record<string, unknown>;
  ipAddress?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLogDocument>(
  {
    performedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    targetModel: { type: String, required: true },
    targetId: { type: String, required: true },
    details: { type: Schema.Types.Mixed, default: {} },
    ipAddress: { type: String },
  },
  { timestamps: true, collection: "AuditLogs" }
);

AuditLogSchema.index({ performedBy: 1, createdAt: -1 });

const AuditLog: Model<IAuditLogDocument> =
  mongoose.models.AuditLog ?? mongoose.model<IAuditLogDocument>("AuditLog", AuditLogSchema);

export default AuditLog;
