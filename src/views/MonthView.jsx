const MonthView = ({ months = [] }) => {
  return (
    <div className="view-container">
      <div className="flex justify-end items-center mb-6">
        <div className="text-sm text-[var(--text-light)]">
          Total Months Loaded: {months.length}
        </div>
      </div>

      {months.length === 0 ? (
        <div className="bg-[var(--bg)] border border-[var(--border)] rounded-lg p-8 text-center text-[var(--text-light)]">
          No month data loaded. Use the "Load Data" option in the top right menu to upload month files.
        </div>
      ) : (
        <div className="grid gap-4">
          {months.map((month, index) => (
            <div key={index} className="bg-[var(--bg)] border border-[var(--border)] rounded-lg p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-[var(--text-h)] mb-2">
                {month.name}
              </h3>
              <pre className="bg-[var(--accent-bg)] p-3 rounded text-xs overflow-auto max-h-40">
                {JSON.stringify(month.data, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MonthView;
