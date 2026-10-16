export const STATUSES = ['waiting', 'replied', 'closed'];
export function todayLocal(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
export function dayNumber(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error('Use a valid calendar date.');
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(0); date.setUTCFullYear(year,month-1,day); date.setUTCHours(0,0,0,0);
  if (year < 1 || date.getUTCFullYear() !== year || date.getUTCMonth() !== month-1 || date.getUTCDate() !== day) throw new Error('Use a valid calendar date.');
  return date.getTime()/86400000;
}
function requiredText(value, label, limit) {
  if(typeof value !== 'string' || !value.trim() || value.trim().length > limit) throw new Error(`${label} is required and must be ${limit} characters or fewer.`);
  return value.trim();
}
export function validateRecord(record, today = todayLocal()) {
  if (!record || typeof record !== 'object' || Array.isArray(record)) throw new Error('Invalid application record.');
  const id = requiredText(record.id,'ID',100);
  const company = requiredText(record.company,'Company',120);
  const role = requiredText(record.role,'Role',160);
  if(!STATUSES.includes(record.status)) throw new Error('Choose Waiting, Replied or Closed.');
  const applied = dayNumber(record.appliedDate), now = dayNumber(today);
  if(applied > now) throw new Error('Application date cannot be in the future.');
  if(record.lastFollowUpDate !== null) {
    const follow = dayNumber(record.lastFollowUpDate);
    if(follow < applied || follow > now) throw new Error('Follow-up date must be between the application date and today.');
  }
  return {id,company,role,appliedDate:record.appliedDate,status:record.status,lastFollowUpDate:record.lastFollowUpDate};
}
export function validateEnvelope(value, today = todayLocal()) {
  if(!value || value.schemaVersion !== 1 || !Array.isArray(value.applications)) throw new Error('This is not a supported FollowThrough backup (version 1).');
  if(value.applications.length > 10000) throw new Error('Backups may contain at most 10,000 applications.');
  const applications=value.applications.map(record=>validateRecord(record,today));
  if(new Set(applications.map(record=>record.id)).size !== applications.length) throw new Error('Backup contains duplicate application IDs.');
  return {schemaVersion:1,applications};
}
export function daysWaiting(record, today = todayLocal()) { return dayNumber(today)-dayNumber(record.lastFollowUpDate ?? record.appliedDate); }
export function dueDate(record) { return new Date((dayNumber(record.lastFollowUpDate ?? record.appliedDate)+7)*86400000).toISOString().slice(0,10); }
export function isDue(record,today=todayLocal()) { return record.status === 'waiting' && daysWaiting(record,today)>=7; }
export function logFollowUp(record,today=todayLocal()) {
  if(record.status !== 'waiting') throw new Error('Only Waiting applications can be followed up.');
  return validateRecord({...record,lastFollowUpDate:today},today);
}
