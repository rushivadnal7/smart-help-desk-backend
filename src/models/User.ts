import { Schema, model } from 'mongoose';


export type Role = 'admin' | 'agent' | 'user';


const userSchema = new Schema(
{
name: { type: String, required: true },
email: { type: String, required: true, unique: true, index: true },
passwordHash: { type: String, required: true },
role: { type: String, enum: ['admin', 'agent', 'user'], default: 'user', index: true }
},
{ timestamps: { createdAt: true, updatedAt: false } }
);


export const User = model('User', userSchema);