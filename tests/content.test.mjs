import test from 'node:test';
import assert from 'node:assert/strict';
import { questions, categories } from '../src/questions.mjs';
import { copy } from '../src/copy.mjs';
import { initialState, validateState } from '../src/state.mjs';

test('all 25 source topics retained exactly once; 11 additions clearly marked', () => {
  assert.equal(questions.length,36);
  assert.equal(new Set(questions.map(q=>q.id)).size,36);
  assert.deepEqual(questions.filter(q=>q.source!==null).map(q=>q.source).sort((a,b)=>a-b),Array.from({length:25},(_,i)=>i+1));
  assert.equal(questions.filter(q=>q.source===null).length,11);
  assert.equal(questions.filter(q=>q.essential).length,12);
});
test('both languages have complete questions and valid topics', () => {
  for(const q of questions) {
    assert.ok(categories.some(c=>c.id===q.category));
    for(const key of ['idText','enText']) for(const field of ['question','why','evidence']) {
      assert.ok(q[key][field].length>15,`${q.id} ${key} ${field}`);
      assert.doesNotMatch(q[key][field], /[—–]/);
    }
  }
  assert.deepEqual(Object.keys(copy.id),Object.keys(copy.en));
});
test('backup preserves multilingual notes and rejects corrupt or unsafe input', () => {
  const s=initialState('Sekolah A','school-a');
  s.schools[0].answers.q01={status:'follow',note:'Bahasa / English <script>alert(1)</script>',star:true};
  assert.deepEqual(validateState(JSON.parse(JSON.stringify(s))),s);
  for(const bad of [null,{}, {...s,version:2}, {...s,activeId:'missing'}, {...s,schools:[]}, {...s,schools:[...s.schools,...s.schools]}]) assert.throws(()=>validateState(bad));
  const invalid=structuredClone(s);invalid.schools[0].answers.q01.status='perfect';assert.throws(()=>validateState(invalid));
  const oversized=structuredClone(s);oversized.schools[0].answers.q01.note='x'.repeat(4001);assert.throws(()=>validateState(oversized));
  const polluted=JSON.parse(JSON.stringify(s));polluted.schools[0].answers=JSON.parse('{"__proto__":{"status":"clear","note":"x","star":false}}');assert.throws(()=>validateState(polluted));
});
