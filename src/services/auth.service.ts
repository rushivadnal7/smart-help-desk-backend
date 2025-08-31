import { User } from '../models/User.js';
import { hash, compare } from '../lib/hash.js';
import { signJwt } from '../lib/jwt.js';


export async function register(name: string, email: string, password: string, role: 'admin' | 'agent' | 'user' = 'user') {
const exists = await User.findOne({ email });
if (exists) throw Object.assign(new Error('Email already used'), { status: 409 });
const u = await User.create({ name, email, passwordHash: hash(password), role });
const token = signJwt({ _id: u._id.toString(), name: u.name, email: u.email, role: u.role });
return { token, user: { _id: u._id, name: u.name, email: u.email, role: u.role } };
}


export async function login(email: string, password: string) {
const u = await User.findOne({ email });
if (!u || !compare(password, u.passwordHash)) throw Object.assign(new Error('Invalid credentials'), { status: 401 });
const token = signJwt({ _id: u._id.toString(), name: u.name, email: u.email, role: u.role });
return { token, user: { _id: u._id, name: u.name, email: u.email, role: u.role } };
}