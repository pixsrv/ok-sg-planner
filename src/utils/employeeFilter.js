import {formatDate} from './formatters';

export const filterEmployees = (employees, searchQuery, settings) => {
  const employeeList = Object.entries(employees || {});
  if (!searchQuery) return employeeList;

  const terms = searchQuery.toLowerCase().split(/\s+/).filter(term => term.length > 0);
  if (terms.length === 0) return employeeList;

  return employeeList.filter(([id, data]) => {
    // Every term must be found in at least one field
    return terms.every(term => {
      // Check ID
      if (id.toLowerCase().includes(term)) return true;

      // Check top-level employee data
      if (data.firstName?.toLowerCase().includes(term)) return true;
      if (data.lastName?.toLowerCase().includes(term)) return true;

      // Check terms
      return data.terms?.some(t =>
        t.position?.toLowerCase().includes(term) ||
        t.fte?.toString().toLowerCase().includes(term) ||
        formatDate(t.validFrom, settings?.dateFormat)?.toLowerCase().includes(term) ||
        (t.validTo ? formatDate(t.validTo, settings?.dateFormat) : 'present').toLowerCase().includes(term),
      );
    });
  });
};
