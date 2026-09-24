import { 
  WORK_LENGTH_MINICHART_NONE, 
  WORK_LENGTH_MINICHART_SEGMENTED,
  WORK_LENGTH_MINICHART_LOLLIPOP,
  WORK_LENGTH_MINICHART_COLORING
} from '../constants/settings';

const HoursStrip = ({ 
  startTime, 
  endTime, 
  fte, 
  reverseSecond = true,
  type = WORK_LENGTH_MINICHART_SEGMENTED 
}) => {
  // Parse times HH:mm to total minutes
  const parseTimeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + (minutes || 0);
  };

  const startMins = startTime ? parseTimeToMinutes(startTime) : 0;
  const endMins = endTime ? parseTimeToMinutes(endTime) : 0;
  const workLengthHours = (startTime && endTime) ? (endMins - startMins) / 60 : 0;

  // FTE is assumed to be based on an 8-hour workday
  const fteHours = fte * 8;
  const isEqualFTE = Math.abs(workLengthHours - fteHours) < 0.001;
  const isUnderFTE = workLengthHours < fteHours;

  const renderStrip = (color, lengthHours, reversed = false) => {
    const segments = [];
    for (let i = 0; i < 8; i++) {
      const segmentStart = i;
      
      let fillPercent = 0;
      if (lengthHours > segmentStart) {
        fillPercent = Math.min(1, (lengthHours - segmentStart)) * 100;
      }

      segments.push(
        <div 
          key={i} 
          className="hours-segment"
          style={{
            flex: 1,
            height: '4px',
            backgroundColor: 'var(--hours-strip-bg)', // Base gray for segments
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {fillPercent > 0 && (
            <div 
              style={{
                position: 'absolute',
                top: 0,
                left: reversed ? 'auto' : 0,
                right: reversed ? 0 : 'auto',
                height: '100%',
                width: `${fillPercent}%`,
                backgroundColor: color
              }}
            />
          )}
        </div>
      );
    }

    const stripStyle = { 
      display: 'flex', 
      width: '100%', 
      flexDirection: reversed ? 'row-reverse' : 'row',
      gap: '1px'
    };

    return (
      <div className="hours-strip" style={stripStyle}>
        {segments}
      </div>
    );
  };

  if (type === WORK_LENGTH_MINICHART_NONE || type === WORK_LENGTH_MINICHART_COLORING) {
    return null;
  }

  const renderLollipop = () => {
    // Lollipop chart will be developed soon
    // For now, return a placeholder or nothing
    return <div className="text-[10px] text-[var(--text-muted)] italic">Lollipop chart soon...</div>;
  };

  let content;
  if (type === WORK_LENGTH_MINICHART_LOLLIPOP) {
    content = renderLollipop();
  } else if (isEqualFTE) {
    content = renderStrip('var(--hours-strip-eq-fte)', workLengthHours);
  } else if (isUnderFTE) {
    content = renderStrip('var(--hours-strip-lt-fte)', workLengthHours);
  } else {
    // isOverFTE
    content = (
      <>
        {renderStrip('var(--hours-strip-gt-fte)', Math.min(8, workLengthHours))}
        {workLengthHours > 8 && renderStrip('var(--hours-strip-gt-fte)', workLengthHours - 8, reverseSecond)}
      </>
    );
  }

  return (
    <div className="hours-strips-container">
      {content}
    </div>
  );
};

export default HoursStrip;
