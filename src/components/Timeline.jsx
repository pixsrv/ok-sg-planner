import {useEffect, useMemo, useRef, useState} from 'react';
import { getISOWeek, MONTH_NAMES } from '../utils/dateUtils';
import { formatDate } from '../utils/formatters';
import {
  DATE_FORMAT_YYYY_MM_DD_ISO,
  TIMELINE_EXTENSION_NONE
} from '../constants/settings';


const Timeline = ({
  year = new Date().getFullYear(),
  selectedWeek,
  onMonthClick,
  onWeekClick,
  settings,
}) => {
  const scrollContainerRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const [hoveredWeek, setHoveredWeek] = useState(null);

  const getWeekRange = (weekNum, yr) => {
    const d = new Date(yr, 0, 4);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff + (weekNum - 1) * 7);

    const start = new Date(d);
    const end = new Date(d);
    end.setDate(end.getDate() + 6);

    const format = settings?.dateFormat || DATE_FORMAT_YYYY_MM_DD_ISO;
    const showYear = start.getFullYear() !== end.getFullYear();

    return `${formatDate(start, format, { showYear })} - ${formatDate(end, format, { showYear })}`;
  };

  const {months, weeks, totalDays} = useMemo(() => {
    const extMonths = parseInt(settings?.timelineExtension || TIMELINE_EXTENSION_NONE, 10);
    
    // We want to calculate the full range of dates to display
    const startDate = new Date(year, -extMonths, 1);
    const endDate = new Date(year, 11 + extMonths, 31);
    
    // Calculate total days for percentage calculations
    const days = (endDate.getTime() - startDate.getTime()) / 86400000 + 1;

    const monthsData = [];
    let currentMonth = new Date(startDate);
    currentMonth.setDate(1); // Ensure we start at the beginning of a month

    while (currentMonth <= endDate) {
      const mYear = currentMonth.getFullYear();
      const mIndex = currentMonth.getMonth();
      const mName = MONTH_NAMES[mIndex];
      
      const firstDayOfMonth = new Date(mYear, mIndex, 1);
      const lastDayOfMonth = new Date(mYear, mIndex + 1, 0);
      
      const daysInMonth = lastDayOfMonth.getDate();
      const diffDays = (firstDayOfMonth.getTime() - startDate.getTime()) / 86400000;
      
      monthsData.push({
        name: `${mName} '${String(mYear).slice(-2)}`,
        index: mIndex + 1,
        year: mYear,
        isAdditional: mYear !== year,
        widthPercent: (daysInMonth / days) * 100,
        leftPercent: (diffDays / days) * 100,
      });
      
      currentMonth.setMonth(currentMonth.getMonth() + 1);
    }

    const weeksDataResult = [];
    // Find the Monday of the week containing startDate
    const startOfFirstWeek = new Date(startDate);
    const firstDayOfWeek = (startOfFirstWeek.getDay() + 6) % 7;
    startOfFirstWeek.setDate(startOfFirstWeek.getDate() - firstDayOfWeek);

    let currentDate = new Date(startOfFirstWeek);

    while (currentDate <= endDate) {
      const { weekNum, weekYear } = getISOWeek(currentDate);
      const diffDays = (currentDate.getTime() - startDate.getTime()) / 86400000;

      weeksDataResult.push({
        num: weekNum,
        year: weekYear,
        isAdditional: weekYear !== year,
        widthPercent: (7 / days) * 100,
        leftPercent: (diffDays / days) * 100,
      });

      currentDate.setDate(currentDate.getDate() + 7);
    }

    return {months: monthsData, weeks: weeksDataResult, totalDays: days};
  }, [year, settings?.timelineExtension]);

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
      const walk = (x - startX.current);

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
        // Use scrollBy with smooth behavior for fluent wheel scroll
        // noinspection JSSuspiciousNameCombination
        container.scrollBy({
          left: e.deltaY,
          behavior: 'smooth',
        });
      }
    };

    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('wheel', handleWheel, {passive: false});

    return () => {
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let animationFrameId = null;

    if (selectedWeek) {
      const selectedWeekData = weeks.find(w => w.num === selectedWeek && w.year === year);
      if (selectedWeekData) {
        const containerWidth = container.offsetWidth;
        // The inner relative div has min-w-[1700px] and mx-8 (32px total margin)
        // We need to find the pixel position of the week.
        // week.leftPercent is relative to the inner content width.
        const innerContent = container.querySelector('.relative');
        if (innerContent) {
          const contentWidth = innerContent.offsetWidth;
          const weekLeft = (selectedWeekData.leftPercent / 100) * contentWidth;
          const weekLeftWithMargin = weekLeft + 32; // mx-8 is 2rem (32px)
          const weekWidth = (selectedWeekData.widthPercent / 100) * contentWidth;

          // Center the week: weekLeftWithMargin + weekWidth/2 - containerWidth/2
          const targetScroll = weekLeftWithMargin + (weekWidth / 2) - (containerWidth / 2);

          // Fluent animated scroll using requestAnimationFrame
          const startScroll = container.scrollLeft;
          const distance = targetScroll - startScroll;
          const duration = 400; // ms
          let startTime = null;

          const animate = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);

            // Easing function: easeOutQuad
            const easeProgress = progress * (2 - progress);

            container.scrollLeft = startScroll + distance * easeProgress;

            if (timeElapsed < duration) {
              animationFrameId = requestAnimationFrame(animate);
            }
          };

          animationFrameId = requestAnimationFrame(animate);
        }
      }
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [selectedWeek, year, weeks]);

  const weekWidth = 36; // px
  const totalWidth = (totalDays / 7) * weekWidth;

  return (
    <div className="flex flex-col mb-6">
      <div
        ref={scrollContainerRef}
        className="w-full overflow-x-auto overflow-y-hidden border border-[var(--border)] bg-[var(--code-bg)] rounded-lg shadow-sm cursor-grab"
      >
        <div 
          className="relative mx-8 h-[80px] overflow-visible"
          style={{ minWidth: `${totalWidth}px` }}
        >
          {months.map((month, idx) => {
            const handleClick = () => {
              // Only trigger click if we are not in a drag state
              if (!scrollContainerRef.current?.classList.contains('active-dragging')) {
                onMonthClick && onMonthClick(month.index, month.year);
              }
            };

            return (
              <div
                key={`m-${month.index}-${month.year}`}
                className={`absolute top-0 h-[40px] flex items-center justify-center cursor-pointer select-none hover:bg-[var(--accent-bg)] hover:text-[var(--accent)] bg-[var(--code-bg)] border-b border-[var(--border)] transition-colors ${month.isAdditional ? 'timeline-additional' : ''}`}
                style={{
                  left: `${month.leftPercent}%`,
                  width: `${month.widthPercent}%`,
                }}
                onClick={handleClick}
              >
                <span className="text-sm font-semibold truncate px-2 text-[var(--text-h)]">{month.name}</span>
                {idx < months.length - 1 && (
                  <div className="absolute right-0 top-0 w-[1px] h-[40px] bg-[var(--border)] z-20"/>
                )}
              </div>
            );
          })}

          {weeks.map((week, idx) => {
            const isSelected = week.num === selectedWeek && week.year === year;
            const handleClick = () => {
              // Only trigger click if we are not in a drag state
              if (!scrollContainerRef.current?.classList.contains('active-dragging')) {
                onWeekClick && onWeekClick(week.num, week.year);
              }
            };

            return (
              <div
                key={`w-${week.num}-${week.year}-${idx}`}
                className={`absolute top-[40px] h-[40px] flex items-center justify-center cursor-pointer select-none hover:bg-[var(--accent-bg)] hover:text-[var(--accent)] bg-[var(--code-bg)] transition-colors ${isSelected ? 'timeline-week-selected' : ''} ${week.isAdditional ? 'timeline-additional' : ''}`}
                style={{
                  left: `${week.leftPercent}%`,
                  width: `${week.widthPercent}%`,
                }}
                onClick={handleClick}
                onMouseEnter={() => setHoveredWeek({num: week.num, year: week.year})}
                onMouseLeave={() => setHoveredWeek(null)}
              >
                <span
                  className={`text-xs px-1 transition-colors ${isSelected ? 'text-[var(--accent)]' : 'text-[var(--text)]'} ${idx === weeks.length - 1 ? '' : 'truncate'}`}>{week.num}</span>
                {idx < weeks.length - 1 && (
                  <div className="absolute right-0 bottom-0 w-[1px] h-[40px] bg-[var(--border)] z-20"/>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="h-4 mt-1 flex justify-end">
        {hoveredWeek && (
          <span className="text-xs text-[var(--text)] opacity-70 px-2">
            Week {hoveredWeek.num}: {getWeekRange(hoveredWeek.num, hoveredWeek.year)}
          </span>
        )}
      </div>
    </div>
  );
};

export default Timeline;
