import { validateEnvelope, todayLocal } from './model.mjs';
export const KEY='followthrough.applications.v1';
export function load(storage,today=todayLocal()) {
  const raw=storage.getItem(KEY);
  if(raw===null) return {schemaVersion:1,applications:[]};
  return validateEnvelope(JSON.parse(raw),today);
}
export function save(storage,envelope,today=todayLocal()) {
  const clean=validateEnvelope(envelope,today);
  storage.setItem(KEY,JSON.stringify(clean));
  return clean;
}
