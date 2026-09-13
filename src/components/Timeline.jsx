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
  selectedWeek,
  onMonthClick,
  onWeekClick
}) => {
  const scrollContainerRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleMouseDown = (e) => {
      isDragging.current = true;
      startX.current = e.pageX - container.offsetLeft;
      scrollLeft.current = container.scrollLeft;
      // Ensure the class is NOT present on mouse down
      container.classList.remove('active-dragging');
    };

    const handleMouseLeave = () => {
      isDragging.current = false;
      container.classList.remove('active-dragging');
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      
      if (container.classList.contains('active-dragging')) {
        // If we WERE dragging, we keep the class for a tiny bit 
        // to block the click event via pointer-events: none.
        setTimeout(() => {
          container.classList.remove('active-dragging');
        }, 50);
      }
    };

    const handleMouseMove = (e) => {
      if (!isDragging.current) return;
      
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX.current) * 2;
      
      // Only start "dragging" (blocking clicks) if moved more than 5px
      if (Math.abs(x - startX.current) > 5) {
        container.classList.add('active-dragging');
      }

      if (container.classList.contains('active-dragging')) {
        // e.preventDefault(); // Might be problematic if we want to allow some default behaviors, but usually fine for drag
        container.scrollLeft = scrollLeft.current - walk;
      }
    };

    const handleWheel = (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
      }
    };

    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  const { months, weeks } = useMemo(() => {
    const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    const totalDays = isLeap ? 366 : 365;

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
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
      className="w-full overflow-x-auto overflow-y-hidden border border-[var(--border)] bg-[var(--code-bg)] mb-6 rounded-lg shadow-sm cursor-grab"
    >
      <div className="relative mx-8 min-w-[1700px] h-[80px] overflow-visible">
        {months.map((month, idx) => {
          const handleClick = () => {
            // Only trigger click if we are not in a drag state
            if (!scrollContainerRef.current?.classList.contains('active-dragging')) {
              onMonthClick && onMonthClick(month.index);
            }
          };

          return (
            <div
              key={`m-${month.index}`}
              className="absolute top-0 h-[40px] flex items-center justify-center cursor-pointer select-none hover:bg-[var(--accent-bg)] hover:text-[var(--accent)] bg-[var(--code-bg)] border-b border-[var(--border)] transition-colors"
              style={{
                left: `${month.leftPercent}%`,
                width: `${month.widthPercent}%`
              }}
              onClick={handleClick}
            >
              <span className="text-sm font-semibold truncate px-2 text-[var(--text-h)]">{month.name}</span>
              {idx < months.length - 1 && (
                <div className="absolute right-0 top-0 w-[1px] h-[40px] bg-[var(--border)] z-20" />
              )}
            </div>
          );
        })}

        {weeks.map((week, idx) => {
          const isSelected = week.num === selectedWeek;
          const handleClick = () => {
            // Only trigger click if we are not in a drag state
            if (!scrollContainerRef.current?.classList.contains('active-dragging')) {
              onWeekClick && onWeekClick(week.num);
            }
          };

          return (
            <div
              key={`w-${week.num}-${idx}`}
              className={`absolute top-[40px] h-[40px] flex items-center justify-center cursor-pointer select-none hover:bg-[var(--accent-bg)] hover:text-[var(--accent)] bg-[var(--code-bg)] transition-colors ${isSelected ? 'timeline-week-selected' : ''}`}
              style={{
                left: `${week.leftPercent}%`,
                width: `${week.widthPercent}%`
              }}
              onClick={handleClick}
            >
              <span className={`text-xs px-1 transition-colors ${isSelected ? 'text-[var(--accent)]' : 'text-[var(--text)]'} ${idx === weeks.length - 1 ? '' : 'truncate'}`}>{week.num}</span>
              {idx < weeks.length - 1 && (
                <div className="absolute right-0 bottom-0 w-[1px] h-[40px] bg-[var(--border)] z-20" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Timeline;
