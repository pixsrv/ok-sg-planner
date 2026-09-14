import {useState} from 'react';
import {formatDate} from '../utils/formatters';
import {Search, X} from 'lucide-react';

const StaffView = ({employees = {}, settings}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const employeeList = Object.entries(employees);

  const filteredEmployees = employeeList.filter(([id, data]) => {
    if (!searchQuery) return true;

    const terms = searchQuery.toLowerCase().split(/\s+/).filter(term => term.length > 0);
    if (terms.length === 0) return true;

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

  return (
    <div className="view-container">
      <div className="flex justify-end items-center mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-light)]"/>
            <input
              type="text"
              placeholder="Search employees..."
              className="pl-10 pr-10 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  handleClearSearch();
                }
              }}
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-light)] hover:text-[var(--text)] transition-colors"
                title="Clear search"
              >
                <X className="w-4 h-4"/>
              </button>
            )}
          </div>
          <div className="text-sm text-[var(--text-light)] ml-2">
            Total Employees: {filteredEmployees.length}
          </div>
        </div>
      </div>

      {filteredEmployees.length === 0 ? (
        <div
          className="bg-[var(--bg)] border border-[var(--border)] rounded-lg p-8 text-center text-[var(--text-light)]">
          {employeeList.length === 0
            ? 'No employee data loaded. Use the "Load Data" option in the top right menu to upload employees.json.'
            : 'No employees match your search.'}
        </div>
      ) : (
        <div className="bg-[var(--bg)] border border-[var(--border)] rounded-lg overflow-hidden shadow-sm">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-[var(--code-bg)] text-[var(--text-h)] font-semibold border-b border-[var(--border)]">
            <tr>
              <th className="px-6 py-3">ID</th>
              <th className="px-6 py-3">First Name</th>
              <th className="px-6 py-3">Last Name</th>
              <th className="px-6 py-3">Valid From</th>
              <th className="px-6 py-3">Valid To</th>
              <th className="px-6 py-3">Position</th>
              <th className="px-6 py-3">FTE</th>
            </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
            {filteredEmployees.map(([id, data]) => (
              <tr key={id} className="hover:bg-[var(--accent-bg)] transition-colors align-top">
                <td className="px-6 py-4 font-mono text-xs">{id}</td>
                <td className="px-6 py-4">{data.firstName}</td>
                <td className="px-6 py-4">{data.lastName}</td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    {data.terms.map((term, index) => (
                      <div key={index} className="text-xs h-5 flex items-center">
                        {formatDate(term.validFrom, settings?.dateFormat)}
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    {data.terms.map((term, index) => (
                      <div key={index} className="text-xs h-5 flex items-center">
                        {term.validTo ? formatDate(term.validTo, settings?.dateFormat) : 'Present'}
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    {data.terms.map((term, index) => (
                      <div key={index} className="text-xs h-5 flex items-center">
                        {term.position}
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    {data.terms.map((term, index) => (
                      <div key={index} className="text-xs h-5 flex items-center">
                        {term.fte}
                      </div>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StaffView;
