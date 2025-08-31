import { Config } from '../models/Config.js';
export async function getConfig() { return (await Config.findOne()) || (await Config.create({})); }
export async function updateConfig(patch: Partial<{ autoCloseEnabled: boolean; confidenceThreshold: number; slaHours: number }>) {
const c = (await Config.findOne()) || (await Config.create({}));
Object.assign(c, patch);
await c.save();
return c;
}