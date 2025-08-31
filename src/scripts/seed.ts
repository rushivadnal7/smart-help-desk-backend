import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Article } from '../models/Article.js';
import { Ticket } from '../models/Ticket.js';
import { Config } from '../models/Config.js';
import { hash } from '../lib/hash.js';


async function run() {
await mongoose.connect(process.env.MONGO_URI!);
await Promise.all([User.deleteMany({}), Article.deleteMany({}), Ticket.deleteMany({}), Config.deleteMany({})]);


const [admin, agent, user] = await User.create([
{ name: 'Admin', email: 'admin@demo.com', passwordHash: hash('Admin@123'), role: 'admin' },
{ name: 'Agent', email: 'agent@demo.com', passwordHash: hash('Agent@123'), role: 'agent' },
{ name: 'User', email: 'user@demo.com', passwordHash: hash('User@123'), role: 'user' }
]);


await Article.create([
{ title: 'How to update payment method', body: 'Go to billing settings and update card.', tags: ['billing', 'payments'], status: 'published' },
{ title: 'Troubleshooting 500 errors', body: 'Clear cache, check auth module.', tags: ['tech', 'errors'], status: 'published' },
{ title: 'Tracking your shipment', body: 'Use the tracking link emailed to you.', tags: ['shipping', 'delivery'], status: 'published' }
]);


await Config.create({ autoCloseEnabled: true, confidenceThreshold: 0.78, slaHours: 48 });


console.log('Seeded users:', { admin: admin.email, agent: agent.email, user: user.email });
await mongoose.disconnect();
}


run().catch((e) => { console.error(e); process.exit(1); });