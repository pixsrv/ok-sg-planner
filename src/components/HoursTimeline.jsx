import { useMemo, useRef } from 'react';
import { Settings } from 'lucide-react';

const HoursTimeline = ({ value, onChange, onDone, onClear, onCancel, onOpenSettings, settings, employee, dayDate }) => {
  const scrollContainerRef = useRef(null);
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
    onChange(type, timeStr);

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
        const endH = Math.floor(totalEndMinutes / 60);
        const endM = totalEndMinutes % 60;
        
        // Round end minutes to resolution
        const roundedEndTotalMinutes = Math.round(totalEndMinutes / timeResolution) * timeResolution;
        const finalEndH = Math.floor(roundedEndTotalMinutes / 60) % 24;
        const finalEndM = roundedEndTotalMinutes % 60;

        const endTimeStr = `${String(finalEndH).padStart(2, '0')}:${String(finalEndM).padStart(2, '0')}`;
        onChange('end', endTimeStr);
      }
    }
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

  return (
    <div 
      className="hours-timeline-popup bg-[var(--code-bg)] border border-[var(--border)] rounded-lg shadow-xl p-4 z-50 min-w-[300px]"
      onClick={handleContainerClick}
    >
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-sm font-bold text-[var(--text-h)]">Select Time</h4>
        <button 
          className="p-1 hover:bg-[var(--accent-bg)] rounded-full transition-colors text-[var(--text-muted)] hover:text-[var(--accent)]"
          onClick={onOpenSettings}
          title="Settings"
        >
          <Settings size={18} />
        </button>
      </div>

      <div className="space-y-6">
        {['start', 'end'].map((type) => {
          const currentTime = type === 'start' ? start : end;
          const currentH = ensureHourInRange(currentTime?.h);
          return (
            <div key={type} className="time-selector-section">
              <div className="text-xs font-semibold mb-2 uppercase text-[var(--text-muted)]">
                {type === 'start' ? 'Start Time' : 'End Time'}: {type === 'start' ? startTime : endTime}
              </div>
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
                  <div className="flex gap-1 justify-center">
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
          );
        })}
      </div>

      <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-[var(--border)]">
        <button 
          className="text-xs px-3 py-1.5 border border-red-500/50 text-red-500 rounded hover:bg-red-500/10 transition-colors mr-auto"
          onClick={onClear}
        >
          Clear
        </button>
        <button 
          className="text-xs px-3 py-1.5 border border-[var(--border)] text-[var(--text)] rounded hover:bg-[var(--accent-bg)] transition-colors"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button 
          className="text-xs px-3 py-1.5 bg-[var(--accent)] text-white rounded hover:opacity-90 transition-colors font-medium"
          onClick={onDone}
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default HoursTimeline;
