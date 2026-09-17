import { useMemo } from 'react';
import { Settings, X, RotateCcw, RotateCw, Trash2 } from 'lucide-react';

/**
 * @typedef {Object} Term
 * @property {string} validFrom
 * @property {string|null} validTo
 * @property {number} fte
 * @property {string} position
 */

const HoursTimeline = ({ value, onChange, onDone, onClear, onUndo, onRedo, onOpenSettings, settings, employee, dayDate }) => {
  const timeResolution = settings?.timeResolution || 1;

  // value is [start, end] where each is 'HH:mm'
  const startTime = value?.[0] || '';
  const endTime = value?.[1] || '';

  const parseTime = (timeStr) => {
    if (!timeStr) return null;
    const [h, m] = timeStr.split(':').map(Number);
    return { h, m };
  };

  const start = parseTime(startTime);
  const end = parseTime(endTime);

  const startHour = settings?.timelineStartHour ?? 0;
  const endHour = settings?.timelineEndHour ?? 23;

  const hours = useMemo(() => {
    const res = [];
    const min = Math.min(startHour, endHour);
    const max = Math.max(startHour, endHour);
    for (let i = min; i <= max; i++) {
      res.push(i);
    }
    return res;
  }, [startHour, endHour]);

  const minutes = useMemo(() => {
    const res = [];
    for (let i = 0; i < 60; i += timeResolution) {
      res.push(i);
    }
    return res;
  }, [timeResolution]);

  const handleTimeClick = (type, h, m) => {
    const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    
    // Auto-set end time logic
    if (type === 'start' && settings?.autoSetEndHourMode && settings.autoSetEndHourMode !== 'none') {
      let durationMinutes = 0;

      if (settings.autoSetEndHourMode === 'fixed') {
        const [workH, workM] = (settings.workDayLength || '08:00').split(':').map(Number);
        durationMinutes = workH * 60 + workM;
      } else if (settings.autoSetEndHourMode === 'calculated' && employee?.terms && dayDate) {
        const term = employee.terms.find(t => {
          const from = t.validFrom;
          const to = t.validTo || '9999-12-31';
          return dayDate >= from && dayDate <= to;
        }) || employee.terms[employee.terms.length - 1];

        const fte = term?.fte ?? 1.0;
        // Standard full time is 8 hours (480 minutes)
        durationMinutes = Math.round(fte * 480);
      }

      if (durationMinutes > 0) {
        const totalStartMinutes = h * 60 + m;
        const totalEndMinutes = (totalStartMinutes + durationMinutes) % (24 * 60);
        
        // Round end minutes to resolution
        const roundedEndTotalMinutes = Math.round(totalEndMinutes / timeResolution) * timeResolution;
        const finalEndH = Math.floor(roundedEndTotalMinutes / 60) % 24;
        const finalEndM = roundedEndTotalMinutes % 60;

        const endTimeStr = `${String(finalEndH).padStart(2, '0')}:${String(finalEndM).padStart(2, '0')}`;
        
        // Use a special 'both' type to update both times at once
        onChange('both', [timeStr, endTimeStr]);
        return;
      }
    }

    onChange(type, timeStr);
  };

  const ensureHourInRange = (h) => {
    if (h === null || h === undefined) return hours[0];
    if (h < hours[0]) return hours[0];
    if (h > hours[hours.length - 1]) return hours[hours.length - 1];
    return h;
  };

  // Prevent clicks inside from closing the popup if we had a click outside listener in parent
  const handleContainerClick = (e) => {
    e.stopPropagation();
  };

  const employeeName = employee ? `${employee.firstName} ${employee.lastName}` : '';
  const coordinateOrder = settings?.coordinateOrder || 'employee-date';
  
  const coordinateDisplay = coordinateOrder === 'employee-date'
    ? `${employeeName} : ${dayDate}`
    : `${dayDate} : ${employeeName}`;

  return (
    <div 
      className="hours-timeline-content bg-[var(--code-bg)] p-2 w-full max-w-7xl"
      onClick={handleContainerClick}
    >
      <div className="flex justify-between items-center mb-4 border-b border-[var(--border)] pb-2 relative">
        <div className="flex items-center gap-2">
          <button 
            className="p-1.5 hover:bg-[var(--accent-bg)] rounded transition-colors text-[var(--text-muted)] hover:text-red-500 flex items-center gap-1 text-xs"
            onClick={onClear}
            title="Clear"
          >
            <Trash2 size={16} />
            <span>Clear</span>
          </button>
          <div className="w-px h-4 bg-[var(--border)] mx-1" />
          <button 
            className="p-1.5 hover:bg-[var(--accent-bg)] rounded transition-colors text-[var(--text-muted)] hover:text-[var(--accent)]"
            onClick={onUndo}
            title="Undo"
          >
            <RotateCcw size={16} />
          </button>
          <button 
            className="p-1.5 hover:bg-[var(--accent-bg)] rounded transition-colors text-[var(--text-muted)] hover:text-[var(--accent)]"
            onClick={onRedo}
            title="Redo"
          >
            <RotateCw size={16} />
          </button>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 text-sm font-medium text-[var(--text)] px-3 py-1 bg-[var(--accent-bg)] rounded border border-[var(--border)] whitespace-nowrap">
          {coordinateDisplay}
        </div>

        <div className="flex items-center gap-2">
          <button 
            className="p-1.5 hover:bg-[var(--accent-bg)] rounded transition-colors text-[var(--text-muted)] hover:text-[var(--accent)]"
            onClick={onOpenSettings}
            title="Settings"
          >
            <Settings size={18} />
          </button>
          <button 
            className="p-1.5 hover:bg-[var(--accent-bg)] rounded transition-colors text-[var(--text-muted)] hover:text-red-500"
            onClick={onDone}
            title="Close"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {['start', 'end'].map((type) => {
          const currentTime = type === 'start' ? start : end;
          const currentH = ensureHourInRange(currentTime?.h);
          return (
            <div key={type} className="flex items-start gap-4">
              <div className="w-24 flex-shrink-0 pt-2">
                <div className="text-[10px] font-bold uppercase text-[var(--text-muted)] leading-tight">
                  {type === 'start' ? 'Start Time' : 'End Time'}
                </div>
                <div className="text-sm font-mono text-[var(--accent)] font-bold">
                  {type === 'start' ? startTime || '--:--' : endTime || '--:--'}
                </div>
              </div>
              
              <div className="flex-grow overflow-hidden">
                <div className="overflow-x-auto pb-2 scrollbar-thin">
                  <div className="flex flex-col gap-1">
                    {/* Hours Ribbon */}
                    <div className="flex gap-1">
                      {hours.map(h => (
                        <div
                          key={h}
                          onClick={() => handleTimeClick(type, h, currentTime?.m || 0)}
                          className={`flex-shrink-0 w-8 h-8 flex items-center justify-center text-xs border rounded cursor-pointer transition-colors
                            ${currentTime?.h === h 
                              ? 'bg-[var(--accent)] text-white border-[var(--accent)]' 
                              : 'bg-[var(--bg)] border-[var(--border)] hover:bg-[var(--accent-bg)] hover:text-[var(--accent)]'}`}
                        >
                          {h}
                        </div>
                      ))}
                    </div>
                    {/* Minutes Ribbon */}
                    <div className="flex gap-1">
                      {minutes.map(m => (
                        <div
                          key={m}
                          onClick={() => handleTimeClick(type, currentH, m)}
                          className={`flex-shrink-0 w-8 h-6 flex items-center justify-center text-[10px] border rounded cursor-pointer transition-colors
                            ${currentTime?.m === m 
                              ? 'bg-[var(--accent-light)] text-[var(--accent)] border-[var(--accent)]' 
                              : 'bg-[var(--bg)] border-[var(--border)] hover:bg-[var(--accent-bg)] hover:text-[var(--accent)]'}`}
                        >
                          {String(m).padStart(2, '0')}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HoursTimeline;
