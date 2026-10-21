import assert from 'node:assert/strict';
import test from 'node:test';
import { EMPLOYEES } from '../src/data.js';

test('contains exactly 10 employees with unique string IDs', () => {
  assert.equal(EMPLOYEES.length, 10);
  const ids = EMPLOYEES.map(({ id }) => id);
  assert.ok(ids.every((id) => typeof id === 'string' && id.length > 0));
  assert.equal(new Set(ids).size, 10);
});

test('each employee has a name and department', () => {
  assert.ok(EMPLOYEES.every(({ name, department }) =>
    typeof name === 'string' && name.trim() &&
    typeof department === 'string' && department.trim()));
});

test('attendance measures are non-negative numbers', () => {
  assert.ok(EMPLOYEES.every(({ attendanceDays, lateDays, overtimeHours }) =>
    Number.isFinite(attendanceDays) && attendanceDays >= 0 &&
    Number.isFinite(lateDays) && lateDays >= 0 &&
    Number.isFinite(overtimeHours) && overtimeHours >= 0));
});
