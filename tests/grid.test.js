import assert from 'node:assert/strict';
import test from 'node:test';
import {
  filterEmployees,
  paginateEmployees,
  sortEmployees,
} from '../src/grid.js';

const employees = [
  { id: 'a', name: 'Charlie', department: 'Engineering', attendanceDays: 2, lateDays: 1, overtimeHours: 4 },
  { id: 'b', name: 'Alpha', department: 'Finance', attendanceDays: 10, lateDays: 3, overtimeHours: 1 },
  { id: 'c', name: 'Bravo', department: 'Engineering', attendanceDays: 1, lateDays: 2, overtimeHours: 8 },
];

test('filters names by case-insensitive partial match', () => {
  assert.deepEqual(filterEmployees(employees, { name: 'ARL', department: '' }).map(({ id }) => id), ['a']);
});

test('filters departments by exact match', () => {
  assert.deepEqual(filterEmployees(employees, { name: '', department: 'Engineering' }).map(({ id }) => id), ['a', 'c']);
  assert.deepEqual(filterEmployees(employees, { name: '', department: 'engineering' }), []);
});

test('empty filters return a copy of all employees', () => {
  const result = filterEmployees(employees, { name: '', department: '' });
  assert.deepEqual(result, employees);
  assert.notStrictEqual(result, employees);
});

test('sorts names and numeric columns ascending and descending', () => {
  const expectedIds = {
    name: ['b', 'c', 'a'],
    attendanceDays: ['c', 'a', 'b'],
    lateDays: ['a', 'c', 'b'],
    overtimeHours: ['b', 'a', 'c'],
  };

  for (const key of Object.keys(expectedIds)) {
    assert.deepEqual(sortEmployees(employees, { key, direction: 'asc' }).map(({ id }) => id), expectedIds[key]);
    assert.deepEqual(sortEmployees(employees, { key, direction: 'desc' }).map(({ id }) => id), [...expectedIds[key]].reverse());
  }
});

test('sorts case-insensitive names consistently and preserves ties', () => {
  const tiedEmployees = [
    { ...employees[0], id: 'z', name: 'Zoe' },
    { ...employees[0], id: 'b', name: 'amy' },
    { ...employees[0], id: 'a', name: 'Amy' },
  ];

  assert.deepEqual(sortEmployees(tiedEmployees, { key: 'name', direction: 'asc' }).map(({ id }) => id), ['b', 'a', 'z']);
  assert.deepEqual(sortEmployees(tiedEmployees, { key: 'name', direction: 'desc' }).map(({ id }) => id), ['z', 'b', 'a']);
  assert.deepEqual(tiedEmployees.map(({ id }) => id), ['z', 'b', 'a']);
});

test('paginates five employees by default and returns the final partial page', () => {
  const tenEmployees = Array.from({ length: 10 }, (_, index) => ({ id: String(index) }));
  assert.deepEqual(paginateEmployees(tenEmployees, 1).map(({ id }) => id), ['0', '1', '2', '3', '4']);
  assert.deepEqual(paginateEmployees(tenEmployees, 2).map(({ id }) => id), ['5', '6', '7', '8', '9']);

  const elevenEmployees = [...tenEmployees, { id: '10' }];
  assert.deepEqual(paginateEmployees(elevenEmployees, 3).map(({ id }) => id), ['10']);
});

test('clamps page numbers to the available range and returns no rows for empty input', () => {
  const tenEmployees = Array.from({ length: 10 }, (_, index) => ({ id: String(index) }));
  assert.deepEqual(paginateEmployees(tenEmployees, 0).map(({ id }) => id), ['0', '1', '2', '3', '4']);
  assert.deepEqual(paginateEmployees(tenEmployees, 99).map(({ id }) => id), ['5', '6', '7', '8', '9']);
  assert.deepEqual(paginateEmployees([], 1), []);
});
