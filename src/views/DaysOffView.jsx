import React from 'react';
import { useDaysOff } from '../hooks/useDaysOff';

const DaysOffView = ({ employees = {}, settings }) => {
  const { daysOff } = useDaysOff();
  const employeeCount = Object.keys(employees).length;

  return (
    <div className="view-container">
      <div className="week-view-header">
        <h2 className="text-xl font-bold text-[var(--text-h)]">Days Off</h2>
        <div className="text-sm text-[var(--text-light)]">
          Managing days off for {employeeCount} employees
        </div>
      </div>

      <div className="bg-[var(--bg)] border border-[var(--border)] rounded-lg p-8 text-center text-[var(--text-light)]">
        <p>This is the Days Off View. Soon you will be able to manage bank holidays and employee vacations here.</p>
        <div className="mt-4 text-xs font-mono">
          Current Days Off Data: {JSON.stringify(daysOff)}
        </div>
      </div>
    </div>
  );
};

export default DaysOffView;
