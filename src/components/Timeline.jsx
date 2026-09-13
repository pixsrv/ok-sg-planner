import  { useMemo, useRef, useEffect } from 'react';

const getISOWeek = (d, anchorYear) => {
  const date = new Date(d.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  const yearToUse = anchorYear || date.getFullYear();
  const week1 = new Date(yearToUse, 0, 4);
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
};

const Timeline = ({
  year = new Date().getFullYear(),
  onMonthClick,
  onWeekClick
}) => {
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  const { months, weeks } = useMemo(() => {
    const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    const totalDays = isLeap ? 366 : 365;

    const monthNames = [
      'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
      'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
    ];
    const monthDays = [31, isLeap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    const monthsData = monthNames.map((name, i) => {
      const daysBefore = monthDays.slice(0, i).reduce((a, b) => a + b, 0);
      return {
        name,
        index: i + 1,
        widthPercent: (monthDays[i] / totalDays) * 100,
        leftPercent: (daysBefore / totalDays) * 100
      };
    });

    const weeksData = [];
    const firstDayOfYear = new Date(year, 0, 1);
    const lastDayOfYear = new Date(year, 11, 31);

    // Find the Monday of the week containing Jan 1st
    const startOfFirstWeek = new Date(firstDayOfYear);
    const firstDayOfWeek = (startOfFirstWeek.getDay() + 6) % 7;
    startOfFirstWeek.setDate(startOfFirstWeek.getDate() - firstDayOfWeek);

    let currentDate = new Date(startOfFirstWeek);

    while (currentDate <= lastDayOfYear) {
      const weekNum = getISOWeek(currentDate, year);
      const diffDays = (currentDate.getTime() - firstDayOfYear.getTime()) / 86400000;

      weeksData.push({
        num: weekNum,
        widthPercent: (7 / totalDays) * 100,
        leftPercent: (diffDays / totalDays) * 100
      });

      currentDate.setDate(currentDate.getDate() + 7);
    }

    return { months: monthsData, weeks: weeksData };
  }, [year]);

  return (
    <div 
      ref={scrollContainerRef}
      className="w-full overflow-x-auto overflow-y-hidden border border-[var(--border)] bg-[var(--code-bg)] mb-6 rounded-lg shadow-sm"
    >
      <div className="relative mx-8 min-w-[1700px] h-[80px] overflow-visible">
        {months.map((month, idx) => (
          <div
            key={`m-${month.index}`}
            className="absolute top-0 h-[40px] flex items-center justify-center cursor-pointer select-none hover:bg-[var(--accent-bg)] hover:text-[var(--accent)] bg-[var(--code-bg)] border-b border-[var(--border)] transition-colors"
            style={{
              left: `${month.leftPercent}%`,
              width: `${month.widthPercent}%`
            }}
            onClick={() => onMonthClick && onMonthClick(month.index)}
          >
            <span className="text-sm font-semibold truncate px-2 text-[var(--text-h)]">{month.name}</span>
            {idx < months.length - 1 && (
              <div className="absolute right-0 top-0 w-[1px] h-[40px] bg-[var(--border)] z-20" />
            )}
          </div>
        ))}

        {weeks.map((week, idx) => (
          <div
            key={`w-${week.num}-${idx}`}
            className="absolute top-[40px] h-[40px] flex items-center justify-center cursor-pointer select-none hover:bg-[var(--accent-bg)] hover:text-[var(--accent)] bg-[var(--code-bg)] transition-colors"
            style={{
              left: `${week.leftPercent}%`,
              width: `${week.widthPercent}%`
            }}
            onClick={() => onWeekClick && onWeekClick(week.num)}
          >
            <span className={`text-xs px-1 text-[var(--text)] ${idx === weeks.length - 1 ? '' : 'truncate'}`}>{week.num}</span>
            {idx < weeks.length - 1 && (
              <div className="absolute right-0 bottom-0 w-[1px] h-[40px] bg-[var(--border)] z-20" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;
