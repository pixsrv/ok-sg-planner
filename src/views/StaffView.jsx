import {useState} from 'react';
import {formatDate} from '../utils/formatters';
import {filterEmployees} from '../utils/employeeFilter';
import EmployeeOmnibox from '../components/EmployeeOmnibox';

const StaffView = ({employees = {}, settings}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const employeeList = Object.entries(employees || {});
  const filteredEmployees = filterEmployees(employees, searchQuery, settings);

  return (
    <div className="view-container">
      <div className="week-view-header">
        <div className="flex items-center gap-4">
          <EmployeeOmnibox 
            value={searchQuery} 
            onChange={setSearchQuery} 
            employees={employees} 
            settings={settings}
          />
        </div>
        <div className="text-sm text-[var(--text-light)]">
          Total Employees: {filteredEmployees.length}
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
