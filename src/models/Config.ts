import { Schema, model } from 'mongoose';


const configSchema = new Schema(
{
autoCloseEnabled: { type: Boolean, default: true },
confidenceThreshold: { type: Number, default: 0.78 },
slaHours: { type: Number, default: 48 }
},
{ versionKey: false }
);


export const Config = model('Config', configSchema);