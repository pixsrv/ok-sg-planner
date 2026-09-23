import {useEffect, useMemo, useRef, useState} from 'react';
import { Settings } from 'lucide-react';
import { getISOWeek, MONTH_NAMES } from '../utils/dateUtils';
import { formatDate } from '../utils/formatters';
import {
  DATE_FORMAT_YYYY_MM_DD_ISO,
  TIMELINE_EXTENSION_NONE
} from '../constants/settings';
import { VIEW_SETTINGS_DATE_TIME } from '../constants/views';


const Timeline = ({
  year = new Date().getFullYear(),
  selectedWeek,
  onMonthClick,
  onWeekClick,
  settings,
  onOpenSettings,
}) => {
  const scrollContainerRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const [hoveredWeek, setHoveredWeek] = useState(null);
  const [isMouseInside, setIsMouseInside] = useState(false);
  const pendingScrollRef = useRef(null); // { week, year, immediate }

  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (scrollContainerRef.current) {
      setContainerWidth(scrollContainerRef.current.offsetWidth);
      const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
          setContainerWidth(entry.contentRect.width);
        }
      });
      resizeObserver.observe(scrollContainerRef.current);
      return () => resizeObserver.disconnect();
    }
  }, []);

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

  const {months, weeks, totalWidth, highlightedMonthIndices} = useMemo(() => {
    const extMonths = parseInt(settings?.timelineExtension || TIMELINE_EXTENSION_NONE, 10);
    
    // We want to calculate the full range of dates to display
    const startDate = new Date(year, -extMonths, 1);
    const endDate = new Date(year, 11 + extMonths, 31);
    
    // Calculate total days for percentage calculations
    const days = (endDate.getTime() - startDate.getTime()) / 86400000 + 1;

    const weekWidth = 36; // px
    const totalWidthValue = (days / 7) * weekWidth;

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

    // Determine highlighted months based on selectedWeek
    const highlightedMonthIndicesSet = new Set();
    if (selectedWeek) {
      const weekStart = new Date(year, 0, 4);
      const day = weekStart.getDay();
      const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
      weekStart.setDate(diff + (selectedWeek - 1) * 7);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      const startMonthKey = `${weekStart.getFullYear()}-${weekStart.getMonth() + 1}`;
      const endMonthKey = `${weekEnd.getFullYear()}-${weekEnd.getMonth() + 1}`;
      
      highlightedMonthIndicesSet.add(startMonthKey);
      highlightedMonthIndicesSet.add(endMonthKey);
    }

    return {
      months: monthsData, 
      weeks: weeksDataResult, 
      totalDays: days, 
      totalWidth: totalWidthValue,
      highlightedMonthIndices: Array.from(highlightedMonthIndicesSet)
    };
  }, [year, settings?.timelineExtension, selectedWeek]);

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

    const handleMouseEnter = () => {
      setIsMouseInside(true);
    };

    const handleMouseLeave = () => {
      isDragging.current = false;
      container.classList.remove('active-dragging');
      setIsMouseInside(false);
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
    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('wheel', handleWheel, {passive: false});

    return () => {
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    if (selectedWeek) {
      // If we already have a pending scroll that was marked immediate, keep it immediate.
      // However, usually selectedWeek changes because of a click, so we update it here.
      // But we don't know if it's immediate here.
      // Let's rely on the fact that if selectedWeek changes, we update pendingScrollRef.
      // If pendingScrollRef was ALREADY set (e.g. by handleClick), we don't want to overwrite its immediate flag with false.
      if (!pendingScrollRef.current || pendingScrollRef.current.week !== selectedWeek || pendingScrollRef.current.year !== year) {
        pendingScrollRef.current = { week: selectedWeek, year, immediate: pendingScrollRef.current?.immediate || false };
      }
    }

    // Only proceed with animation if mouse is outside OR it's an immediate scroll
    if ((isMouseInside && !pendingScrollRef.current?.immediate) || !pendingScrollRef.current) return;

    const targetWeek = pendingScrollRef.current.week;
    const targetYear = pendingScrollRef.current.year;

    let animationFrameId = null;

    const selectedWeekData = weeks.find(w => w.num === targetWeek && w.year === targetYear);
    if (selectedWeekData) {
      const innerContent = container.querySelector('.relative');
      if (innerContent) {
        const weekLeft = (selectedWeekData.leftPercent / 100) * totalWidth;
        const weekWidth = (selectedWeekData.widthPercent / 100) * totalWidth;

        const targetScroll = weekLeft + (weekWidth / 2);

        const startScroll = container.scrollLeft;
        const distance = targetScroll - startScroll;
        const duration = 400; // ms
        let startTime = null;

        const animate = (currentTime) => {
          if (!startTime) startTime = currentTime;
          const timeElapsed = currentTime - startTime;
          const progress = Math.min(timeElapsed / duration, 1);

          const easeProgress = progress * (2 - progress);

          container.scrollLeft = startScroll + distance * easeProgress;

          if (timeElapsed < duration) {
            animationFrameId = requestAnimationFrame(animate);
          } else {
            pendingScrollRef.current = null;
          }
        };

        animationFrameId = requestAnimationFrame(animate);
      }
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [selectedWeek, year, weeks, isMouseInside, containerWidth, totalWidth]);

  return (
    <div className="flex flex-col mb-6">
      <div
        ref={scrollContainerRef}
        className="w-full overflow-x-auto overflow-y-hidden border border-[var(--border)] bg-[var(--code-bg)] rounded-lg shadow-sm cursor-grab"
      >
        <div 
          className="flex"
          style={{ width: totalWidth + containerWidth }}
        >
          <div style={{ width: containerWidth / 2, flexShrink: 0 }} />
          <div 
            className="relative h-[80px] shrink-0"
            style={{ width: totalWidth }}
          >
            {months.map((month, idx) => {
              const isSelected = highlightedMonthIndices.includes(`${month.year}-${month.index}`);
              const handleClick = () => {
                // Only trigger click if we are not in a drag state
                if (!scrollContainerRef.current?.classList.contains('active-dragging')) {
                  const result = onMonthClick && onMonthClick(month.index, month.year);
                  if (result?.isAdditional) {
                    // We don't have the selectedWeek yet here usually (it updates via props),
                    // but we can set a flag that the NEXT scroll should be immediate.
                    // Actually, since selectedWeek is about to change, we can pre-set pendingScrollRef.
                    // We need to guess which week will be selected. For month click, it's usually week containing 1st of month.
                    // But the parent handles the logic. 
                    // Let's just set a temporary flag.
                    pendingScrollRef.current = { ...pendingScrollRef.current, immediate: true };
                  }
                }
              };

              return (
                <div
                  key={`m-${month.index}-${month.year}`}
                  className={`absolute top-0 h-[40px] flex items-center justify-center cursor-pointer select-none hover:bg-[var(--selection-bg-dimmed)] hover:text-[var(--selection-g1)] bg-[var(--code-bg)] border-b border-[var(--border)] transition-colors ${month.isAdditional ? 'timeline-additional' : ''} ${isSelected ? 'timeline-month-selected' : ''}`}
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
                  const result = onWeekClick && onWeekClick(week.num, week.year);
                  if (result?.isAdditional) {
                    pendingScrollRef.current = { week: week.num, year: week.year, immediate: true };
                  }
                }
              };

              const isFirst = idx === 0;
              const isLast = idx === weeks.length - 1;

              return (
                <div
                  key={`w-${week.num}-${week.year}-${idx}`}
                  className={`absolute top-[40px] h-[40px] flex items-center justify-center cursor-pointer select-none hover:bg-[var(--selection-bg-dimmed)] hover:text-[var(--selection-g1)] bg-[var(--code-bg)] transition-colors ${isSelected ? 'timeline-week-selected' : ''} ${week.isAdditional ? 'timeline-additional' : ''}`}
                  style={{
                    left: `${week.leftPercent}%`,
                    width: `${week.widthPercent}%`,
                  }}
                  onClick={handleClick}
                  onMouseEnter={() => setHoveredWeek({num: week.num, year: week.year})}
                  onMouseLeave={() => setHoveredWeek(null)}
                >
                  {isFirst && (
                    <div 
                      className="absolute right-full mr-2 top-0 text-[var(--text-muted)] hover:text-[var(--selection-g1)] transition-colors"
                      style={{ top: '0', transform: 'translateY(-50%)' }}
                      title="Timeline Extension Settings"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenSettings?.(VIEW_SETTINGS_DATE_TIME, 'timeline-extension-panel');
                      }}
                    >
                      <Settings size={20} />
                    </div>
                  )}
                  <span
                    className={`text-xs px-1 transition-colors ${isSelected ? 'text-[var(--selection-g1)]' : 'text-[var(--text)]'} ${isLast ? '' : 'truncate'}`}>{week.num}</span>
                  {idx < weeks.length - 1 && (
                    <div className="absolute right-0 bottom-0 w-[1px] h-[40px] bg-[var(--border)] z-20"/>
                  )}
                  {isLast && (
                    <div 
                      className="absolute left-full ml-2 top-0 text-[var(--text-muted)] hover:text-[var(--selection-g1)] transition-colors"
                      style={{ top: '0', transform: 'translateY(-50%)' }}
                      title="Timeline Extension Settings"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenSettings?.(VIEW_SETTINGS_DATE_TIME, 'timeline-extension-panel');
                      }}
                    >
                      <Settings size={20} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div style={{ width: containerWidth / 2, flexShrink: 0 }} />
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
