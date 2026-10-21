import { EMPLOYEES } from './data.js';
import {
  filterEmployees,
  paginateEmployees,
  sortEmployees,
} from './grid.js';

const PAGE_SIZE = 5;
const SORTABLE_KEYS = new Set(['name', 'attendanceDays', 'lateDays', 'overtimeHours']);

function getElement(id) {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Required page element not found: #${id}`);
  }
  return element;
}

const nameFilter = getElement('name-filter');
const departmentFilter = getElement('department-filter');
const employeeGrid = getElement('employee-grid');
const employeeRows = getElement('employee-rows');
const gridStatus = getElement('grid-status');
const emptyState = getElement('empty-state');
const pageIndicator = getElement('page-indicator');
const previousPageButton = getElement('previous-page');
const nextPageButton = getElement('next-page');
const filterForm = nameFilter.closest('form');

if (!filterForm) {
  throw new Error('Employee filters must be contained in a form');
}

const state = {
  name: '',
  department: '',
  sortKey: 'name',
  sortDirection: 'asc',
  page: 1,
  activeCell: { rowIndex: 0, columnIndex: 0 },
  selectedIds: new Set(),
  announcement: '',
};

for (const department of [...new Set(EMPLOYEES.map((employee) => employee.department))]
  .sort((left, right) => left < right ? -1 : left > right ? 1 : 0)) {
  const option = document.createElement('option');
  option.value = department;
  option.textContent = department;
  departmentFilter.append(option);
}

function updateSortHeaders() {
  for (const button of employeeGrid.querySelectorAll('[data-sort-key]')) {
    const key = button.dataset.sortKey;
    if (!SORTABLE_KEYS.has(key)) {
      throw new Error(`Unsupported sortable header: ${key}`);
    }
    const header = button.closest('th');
    if (!header) {
      throw new Error(`Sortable header ${key} is missing its table heading`);
    }
    header.setAttribute(
      'aria-sort',
      key === state.sortKey
        ? state.sortDirection === 'asc' ? 'ascending' : 'descending'
        : 'none',
    );
  }
}

function createCell(value, headerId) {
  const cell = document.createElement('td');
  cell.setAttribute('role', 'gridcell');
  cell.setAttribute('headers', headerId);
  cell.textContent = String(value);
  return cell;
}

function createEmployeeRow(employee, rowIndex) {
  const row = document.createElement('tr');
  row.setAttribute('role', 'row');
  row.setAttribute('aria-rowindex', String((state.page - 1) * PAGE_SIZE + rowIndex + 2));
  row.setAttribute('aria-selected', String(state.selectedIds.has(employee.id)));
  row.dataset.employeeId = employee.id;

  const nameCell = createCell(employee.name, 'employee-header');
  nameCell.classList.add('employee-name');
  if (state.selectedIds.has(employee.id)) {
    const marker = document.createElement('span');
    marker.className = 'selection-marker';
    marker.textContent = 'Selected';
    nameCell.append(marker);
  }

  row.append(
    nameCell,
    createCell(employee.department, 'department-header'),
    createCell(employee.attendanceDays, 'attendance-header'),
    createCell(employee.lateDays, 'late-header'),
    createCell(employee.overtimeHours, 'overtime-header'),
  );
  return row;
}

function getGridRows() {
  return [...employeeGrid.querySelectorAll('[role="row"]')];
}

function getRowCells(row) {
  return [...row.querySelectorAll(':scope > [role="columnheader"], :scope > [role="gridcell"]')];
}

function getCellPosition(cell) {
  const row = cell.closest('[role="row"]');
  const rows = getGridRows();
  if (!row) {
    return null;
  }
  const rowIndex = rows.indexOf(row);
  const columnIndex = getRowCells(row).indexOf(cell);
  if (rowIndex < 0 || columnIndex < 0) {
    return null;
  }
  return { rowIndex, columnIndex };
}

function getFocusedGridCell() {
  if (!employeeGrid.contains(document.activeElement)) {
    return null;
  }
  const cell = document.activeElement.closest('[role="columnheader"], [role="gridcell"]');
  return cell ? getCellPosition(cell) : null;
}

function updateRovingTabIndex(focusSnapshot = null) {
  if (focusSnapshot) {
    state.activeCell = focusSnapshot;
  }

  const rows = getGridRows();
  const rowIndex = Math.max(0, Math.min(state.activeCell.rowIndex, rows.length - 1));
  const rowCells = getRowCells(rows[rowIndex]);
  const columnIndex = Math.max(0, Math.min(state.activeCell.columnIndex, rowCells.length - 1));
  state.activeCell = { rowIndex, columnIndex };

  for (const row of rows) {
    for (const cell of getRowCells(row)) {
      cell.tabIndex = -1;
    }
  }
  const activeCell = rowCells[columnIndex];
  activeCell.tabIndex = 0;
  if (focusSnapshot) {
    activeCell.focus();
  }
}

function render() {
  const focusSnapshot = getFocusedGridCell();
  const filtered = filterEmployees(EMPLOYEES, {
    name: state.name,
    department: state.department,
  });
  const sorted = sortEmployees(filtered, {
    key: state.sortKey,
    direction: state.sortDirection,
  });
  const pageCount = Math.ceil(sorted.length / PAGE_SIZE);
  state.page = pageCount === 0 ? 1 : Math.min(state.page, pageCount);
  const pageEmployees = paginateEmployees(sorted, state.page, PAGE_SIZE);

  employeeRows.replaceChildren(...pageEmployees.map(createEmployeeRow));
  employeeGrid.setAttribute('aria-rowcount', String(sorted.length + 1));
  updateSortHeaders();
  updateRovingTabIndex(focusSnapshot);

  const hasResults = sorted.length > 0;
  emptyState.hidden = hasResults;
  gridStatus.textContent = state.announcement || (hasResults
    ? `Showing ${(state.page - 1) * PAGE_SIZE + 1}-${(state.page - 1) * PAGE_SIZE + pageEmployees.length} of ${sorted.length} employees.`
    : 'No employees match the current filters.');
  state.announcement = '';
  pageIndicator.textContent = hasResults
    ? `Page ${state.page} of ${pageCount}`
    : 'Page 0 of 0';
  previousPageButton.disabled = !hasResults || state.page === 1;
  nextPageButton.disabled = !hasResults || state.page === pageCount;
}

employeeGrid.addEventListener('focusin', (event) => {
  const cell = event.target.closest('[role="columnheader"], [role="gridcell"]');
  const position = cell ? getCellPosition(cell) : null;
  if (position) {
    state.activeCell = position;
    updateRovingTabIndex();
  }
});

employeeGrid.addEventListener('keydown', (event) => {
  const cell = event.target.closest('[role="columnheader"], [role="gridcell"]');
  const position = cell ? getCellPosition(cell) : null;
  if (!position) {
    return;
  }

  const movement = {
    ArrowUp: [-1, 0],
    ArrowDown: [1, 0],
    ArrowLeft: [0, -1],
    ArrowRight: [0, 1],
  }[event.key];

  if (movement) {
    event.preventDefault();
    const rows = getGridRows();
    const rowIndex = Math.max(0, Math.min(position.rowIndex + movement[0], rows.length - 1));
    const rowCells = getRowCells(rows[rowIndex]);
    const columnIndex = Math.max(0, Math.min(position.columnIndex + movement[1], rowCells.length - 1));
    state.activeCell = { rowIndex, columnIndex };
    updateRovingTabIndex();
    rowCells[columnIndex].focus();
    return;
  }

  if (event.key === 'Enter') {
    event.preventDefault();
    const row = cell.closest('[role="row"]');
    const employeeId = row?.dataset.employeeId;
    if (employeeId) {
      state.selectedIds.add(employeeId);
      state.announcement = `${EMPLOYEES.find((employee) => employee.id === employeeId).name} selected.`;
      render();
    } else {
      cell.querySelector('[data-sort-key]')?.click();
    }
    return;
  }

  if (event.key === ' ' || event.key === 'Spacebar') {
    event.preventDefault();
    const row = cell.closest('[role="row"]');
    const employeeId = row?.dataset.employeeId;
    if (!employeeId) {
      return;
    }
    if (state.selectedIds.has(employeeId)) {
      state.selectedIds.delete(employeeId);
      state.announcement = `${EMPLOYEES.find((employee) => employee.id === employeeId).name} deselected.`;
    } else {
      state.selectedIds.add(employeeId);
      state.announcement = `${EMPLOYEES.find((employee) => employee.id === employeeId).name} selected.`;
    }
    render();
  }
});

filterForm.addEventListener('submit', (event) => event.preventDefault());
nameFilter.addEventListener('input', () => {
  state.name = nameFilter.value;
  state.page = 1;
  render();
});
departmentFilter.addEventListener('change', () => {
  state.department = departmentFilter.value;
  state.page = 1;
  render();
});

for (const button of employeeGrid.querySelectorAll('[data-sort-key]')) {
  button.addEventListener('click', () => {
    const key = button.dataset.sortKey;
    if (!SORTABLE_KEYS.has(key)) {
      throw new Error(`Unsupported sortable header: ${key}`);
    }
    state.sortDirection = state.sortKey === key && state.sortDirection === 'asc' ? 'desc' : 'asc';
    state.sortKey = key;
    state.page = 1;
    render();
  });
}

previousPageButton.addEventListener('click', () => {
  if (state.page > 1) {
    state.page -= 1;
    render();
  }
});
nextPageButton.addEventListener('click', () => {
  state.page += 1;
  render();
});

render();
