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
        <div className="grid gap-4">
          {employeeList.map(([id, data]) => (
            <div key={id} className="bg-[var(--bg)] border border-[var(--border)] rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--text-h)]">
                    {data.firstName} {data.lastName}
                  </h3>
                  <p className="text-sm text-[var(--text-light)]">ID: {id}</p>
                </div>
              </div>
              
              <div className="mt-4">
                <h4 className="text-sm font-medium text-[var(--text)] mb-2">Terms</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="border-b border-[var(--border)]">
                        <th className="pb-2 pr-4">Valid From</th>
                        <th className="pb-2 pr-4">Valid To</th>
                        <th className="pb-2">FTE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.terms.map((term, index) => (
                        <tr key={index} className="border-b border-[var(--border)] last:border-0">
                          <td className="py-2 pr-4">{term.validFrom}</td>
                          <td className="py-2 pr-4">{term.validTo || 'Present'}</td>
                          <td className="py-2">{term.fte}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StaffView;
