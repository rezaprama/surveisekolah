export const STATUSES = ['unasked', 'clear', 'follow', 'na'];
export const QUESTION_IDS = new Set(Array.from({length:36}, (_,i) => `q${String(i+1).padStart(2,'0')}`));
export function validateState(value) {
  if (!value || value.version !== 1 || !Array.isArray(value.schools) || value.schools.length < 1 || value.schools.length > 3) throw new Error('Invalid backup');
  const ids = new Set();
  const schools = value.schools.map(s => {
    if (!s || typeof s.id !== 'string' || !/^[a-zA-Z0-9-]{1,80}$/.test(s.id) || ids.has(s.id) || typeof s.name !== 'string' || s.name.length > 80 || !s.answers || typeof s.answers !== 'object' || Array.isArray(s.answers)) throw new Error('Invalid school');
    ids.add(s.id);
    const answers = Object.fromEntries(Object.entries(s.answers).map(([id,a]) => {
      if (!QUESTION_IDS.has(id) || !a || !STATUSES.includes(a.status) || typeof a.note !== 'string' || a.note.length > 4000 || typeof a.star !== 'boolean') throw new Error('Invalid answer');
      return [id, { status:a.status, note:a.note, star:a.star }];
    }));
    return {id:s.id,name:s.name,answers};
  });
  if (!ids.has(value.activeId)) throw new Error('Invalid active school');
  return { version:1, activeId:value.activeId, schools };
}
export function initialState(name, id) {
  return { version:1, activeId:id, schools:[{id,name,answers:{}}] };
}
