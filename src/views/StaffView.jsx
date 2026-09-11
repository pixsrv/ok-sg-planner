const StaffView = ({ employees = {} }) => {
  const employeeList = Object.entries(employees);

  return (
    <div className="view-container">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-h)]">Staff</h1>
        <div className="text-sm text-[var(--text-light)]">
          Total Employees: {employeeList.length}
        </div>
      </div>

      {employeeList.length === 0 ? (
        <div className="bg-[var(--bg)] border border-[var(--border)] rounded-lg p-8 text-center text-[var(--text-light)]">
          No employee data loaded. Use the "Load Data" option in the top right menu to upload employees.json.
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
                <th className="px-6 py-3">FTE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {employeeList.map(([id, data]) => (
                <tr key={id} className="hover:bg-[var(--accent-bg)] transition-colors align-top">
                  <td className="px-6 py-4 font-mono text-xs">{id}</td>
                  <td className="px-6 py-4">{data.firstName}</td>
                  <td className="px-6 py-4">{data.lastName}</td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {data.terms.map((term, index) => (
                        <div key={index} className="text-xs h-5 flex items-center">
                          {term.validFrom}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {data.terms.map((term, index) => (
                        <div key={index} className="text-xs h-5 flex items-center">
                          {term.validTo || 'Present'}
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
