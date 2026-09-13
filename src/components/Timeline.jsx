import  { useMemo, useRef, useEffect } from 'react';

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
    const currentDate = new Date(year, 0, 1);

    const getISOWeek = (d) => {
      const date = new Date(d.getTime());
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
      const week1 = new Date(date.getFullYear(), 0, 4);
      return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
    };

    let dayOfYear = 0;
    
    while (dayOfYear < totalDays) {
      const weekNum = getISOWeek(currentDate);
      const currentDayOfWeek = (currentDate.getDay() + 6) % 7;
      const daysLeftInWeek = 7 - currentDayOfWeek;
      const daysInThisWeekChunk = Math.min(daysLeftInWeek, totalDays - dayOfYear);

      weeksData.push({
        num: weekNum,
        widthPercent: (daysInThisWeekChunk / totalDays) * 100,
        leftPercent: (dayOfYear / totalDays) * 100
      });

      dayOfYear += daysInThisWeekChunk;
      currentDate.setDate(currentDate.getDate() + daysInThisWeekChunk);
    }

    return { months: monthsData, weeks: weeksData };
  }, [year]);

  return (
    <div 
      ref={scrollContainerRef}
      className="w-full overflow-x-auto overflow-y-hidden border border-black bg-white"
    >
      <div className="relative min-w-[1700px] h-[80px]">
        {months.map((month, idx) => (
          <div
            key={`m-${month.index}`}
            className="absolute top-0 h-[40px] flex items-center justify-center cursor-pointer select-none hover:bg-black/5"
            style={{
              left: `${month.leftPercent}%`,
              width: `${month.widthPercent}%`
            }}
            onClick={() => onMonthClick && onMonthClick(month.index)}
          >
            <span className="text-sm font-semibold truncate px-2">{month.name}</span>
            {idx < months.length - 1 && (
              <div className="absolute right-0 top-0 w-[1px] h-[48px] bg-black z-20" />
            )}
          </div>
        ))}

        <div className="absolute top-[40px] left-0 w-full h-[1px] bg-black z-10" />

        {weeks.map((week, idx) => (
          <div
            key={`w-${week.num}-${idx}`}
            className="absolute top-[40px] h-[40px] flex items-center justify-center cursor-pointer select-none hover:bg-black/5"
            style={{
              left: `${week.leftPercent}%`,
              width: `${week.widthPercent}%`
            }}
            onClick={() => onWeekClick && onWeekClick(week.num)}
          >
            <span className="text-xs truncate px-1">{week.num}</span>
            {idx < weeks.length - 1 && (
              <div className="absolute right-0 bottom-0 w-[1px] h-[48px] bg-black z-20" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;
