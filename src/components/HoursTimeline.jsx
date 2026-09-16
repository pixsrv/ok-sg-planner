import  { useMemo, useRef } from 'react';

const HoursTimeline = ({ value, onChange, onDone, settings }) => {
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
          className="text-xs px-2 py-1 bg-[var(--accent)] text-white rounded hover:opacity-90"
          onClick={onDone}
        >
          Done
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
          );
        })}
      </div>
    </div>
  );
};

export default HoursTimeline;
