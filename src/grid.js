const SORT_KEYS = new Set(['name', 'attendanceDays', 'lateDays', 'overtimeHours']);

export function filterEmployees(employees, { name = '', department = '' } = {}) {
  const searchName = name.trim().toLowerCase();
  return employees.filter((employee) =>
    (!searchName || employee.name.toLowerCase().includes(searchName)) &&
    (!department || employee.department === department));
}

export function sortEmployees(employees, { key, direction }) {
  if (!SORT_KEYS.has(key)) {
    throw new RangeError(`Unsupported sort key: ${key}`);
  }
  if (direction !== 'asc' && direction !== 'desc') {
    throw new RangeError(`Unsupported sort direction: ${direction}`);
  }

  const multiplier = direction === 'asc' ? 1 : -1;
  return employees
    .map((employee, index) => ({ employee, index }))
    .sort(({ employee: left, index: leftIndex }, { employee: right, index: rightIndex }) => {
      const leftValue = left[key];
      const rightValue = right[key];
      const comparison = key === 'name'
        ? leftValue.toLowerCase() < rightValue.toLowerCase()
          ? -1
          : leftValue.toLowerCase() > rightValue.toLowerCase()
            ? 1
            : 0
        : leftValue - rightValue;
      return comparison === 0 ? leftIndex - rightIndex : comparison * multiplier;
    })
    .map(({ employee }) => employee);
}

export function paginateEmployees(employees, page, pageSize = 5) {
  if (!Number.isFinite(page)) {
    throw new TypeError('Page must be a finite number');
  }
  if (!Number.isInteger(pageSize) || pageSize < 1) {
    throw new RangeError('Page size must be a positive integer');
  }

  if (employees.length === 0) {
    return [];
  }

  const pageCount = Math.ceil(employees.length / pageSize);
  const currentPage = Math.max(1, Math.min(Math.floor(page), pageCount));
  const start = (currentPage - 1) * pageSize;
  return employees.slice(start, start + pageSize);
}
