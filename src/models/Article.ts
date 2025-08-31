import { Schema, model } from 'mongoose';


const articleSchema = new Schema(
{
title: { type: String, required: true },
body: { type: String, required: true },
tags: [{ type: String, index: true }],
status: { type: String, enum: ['draft', 'published'], default: 'draft', index: true }
},
{ timestamps: { createdAt: false, updatedAt: true } }
);


export const Article = model('Article', articleSchema);