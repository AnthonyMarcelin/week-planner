import { useState } from 'react';
import { HOUR_HEIGHT_DASHBOARD, timeToNumber } from '@/constants';

export default function WeekGrid({
    activities,
    profiles,
    currentProfileId,
    weekOffset,
    isNightHidden,
    selectedDayMobile,
    onActivityClick,
    onDayMobileChange
}) {
    const startHour = isNightHidden ? 4 : 0;
    const visibleHours = Array.from(
        { length: 24 - startHour },
        (_, i) => i + startHour
    );

    const days = [
        'Lundi',
        'Mardi',
        'Mercredi',
        'Jeudi',
        'Vendredi',
        'Samedi',
        'Dimanche',
    ];

    const weekDates = (() => {
        const now = new Date();
        const currentDay = now.getDay();
        const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;

        const mondayOfCurrentWeek = new Date(now);
        mondayOfCurrentWeek.setDate(now.getDate() + distanceToMonday);

        const displayedMonday = new Date(mondayOfCurrentWeek);
        displayedMonday.setDate(mondayOfCurrentWeek.getDate() + weekOffset * 7);

        const displayedSunday = new Date(displayedMonday);
        displayedSunday.setDate(displayedMonday.getDate() + 6);

        const format = d =>
            d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });

        return {
            start: format(displayedMonday),
            end: format(displayedSunday),
            mondayObject: displayedMonday,
            todayString: new Date().toLocaleDateString('fr-FR'),
        };
    })();

    return (
        <>
            <div className='md:hidden flex overflow-x-auto pb-4 gap-2 px-4 scrollbar-hide'>
                {days.map((day, index) => {
                    const d = new Date(weekDates.mondayObject);
                    d.setDate(d.getDate() + index);
                    const isToday =
                        d.toLocaleDateString('fr-FR') ===
                        weekDates.todayString;

                    return (
                        <button
                            key={day}
                            onClick={() => onDayMobileChange(index)}
                            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all shadow-sm border flex flex-col items-center
                                ${
                                    selectedDayMobile === index
                                        ? 'bg-indigo-600 text-white border-indigo-600'
                                        : isToday
                                          ? 'bg-white text-indigo-600 border-indigo-200 ring-2 ring-indigo-100'
                                          : 'bg-white text-slate-500 border-slate-200'
                                }`}
                        >
                            <span>{day.slice(0, 3)}</span>
                            <span className='text-[10px] font-normal'>
                                {d.getDate()}
                            </span>
                        </button>
                    );
                })}
            </div>

            <div className='md:hidden bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4'>
                <div className='flex items-center justify-between'>
                    <span className='font-bold text-yellow-800'>
                        {days[selectedDayMobile]} - {new Date(weekDates.mondayObject).getDate() + selectedDayMobile}
                    </span>
                    <button
                        onClick={() => onDayMobileChange((prev) => (prev + 1) % 7)}
                        className='text-yellow-600 hover:text-yellow-800 text-sm'
                    >
                        Jour suivant →
                    </button>
                </div>
            </div>

            <div className='flex bg-white shadow-xl shadow-slate-200/60 sm:rounded-2xl overflow-hidden border border-slate-200'>
                {/* Colonne des heures */}
                <div className='w-14 sm:w-20 bg-slate-50/50 border-r border-slate-200 pt-[48px] flex-shrink-0'>
                    {visibleHours.map(hour => (
                        <div
                            key={hour}
                            className='h-[60px] text-[10px] sm:text-xs text-slate-400 text-center border-b border-slate-100 font-medium flex items-center justify-center'
                        >
                            {hour.toString().padStart(2, '0')}:00
                        </div>
                    ))}
                </div>

                <div className='flex-1 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 overflow-hidden'>
                    {days.map((day, dayIndex) => {
                        const columnDate = new Date(
                            weekDates.mondayObject
                        );
                        columnDate.setDate(
                            columnDate.getDate() + dayIndex
                        );
                        const isToday =
                            columnDate.toLocaleDateString('fr-FR') ===
                            weekDates.todayString;

                        return (
                            <div
                                key={day}
                                className={`relative border-r border-slate-100 last:border-r-0 ${
                                    dayIndex === selectedDayMobile ? 'block' : 'hidden'
                                } md:block`}
                            >
                                <div
                                    className={`h-[48px] border-b border-slate-200 flex flex-col items-center justify-center font-bold text-[10px] uppercase tracking-widest transition-colors
                                    ${isToday ? 'bg-indigo-600 text-white shadow-inner' : 'bg-slate-50/30 text-slate-600'}`}
                                >
                                    <span>{day}</span>
                                    <span
                                        className={`text-[9px] ${isToday ? 'text-indigo-100' : 'text-slate-400'}`}
                                    >
                                        {columnDate.getDate()}{' '}
                                        {columnDate
                                            .toLocaleDateString(
                                                'fr-FR',
                                                { month: 'short' }
                                            )
                                            .toUpperCase()}
                                    </span>
                                </div>

                                <div className='relative'>
                                    {visibleHours.map(hour => (
                                        <div
                                            key={hour}
                                            className='h-[60px] border-b border-slate-50'
                                        ></div>
                                    ))}

                                    {activities &&
                                        activities
                                            .filter(
                                                a =>
                                                    Number(
                                                        a.day_of_week
                                                    ) === dayIndex &&
                                                    timeToNumber(
                                                        a.start_time
                                                    ) >= startHour &&
                                                    Number(
                                                        a.week_index
                                                    ) === weekOffset
                                            )
                                            .map(activity => {
                                                const start =
                                                    timeToNumber(
                                                        activity.start_time
                                                    );
                                                const end =
                                                    timeToNumber(
                                                        activity.end_time
                                                    );
                                                const duration =
                                                    end - start;

                                                return (
                                                    <div
                                                        key={
                                                            activity.id
                                                        }
                                                        onClick={() =>
                                                            onActivityClick(
                                                                activity
                                                            )
                                                        }
                                                        className={`absolute left-1 right-1 rounded-md p-2 text-[10px] leading-tight overflow-hidden shadow-sm border-l-4 z-10 cursor-pointer transition-all hover:brightness-95 hover:scale-[1.02] hover:shadow-md hover:z-50
                                                        ${
                                                            activity.type ===
                                                            'pro'
                                                                ? 'bg-indigo-50 text-indigo-700 border-indigo-500'
                                                                : 'bg-emerald-50 text-emerald-700 border-emerald-500'
                                                        }`}
                                                        style={{
                                                            top: `${(start - startHour) * HOUR_HEIGHT_DASHBOARD}px`,
                                                            height: `${duration * HOUR_HEIGHT_DASHBOARD}px`,
                                                            minHeight:
                                                                '28px',
                                                        }}
                                                    >
                                                        <div
                                                            className={`flex ${duration <= 0.5 ? 'flex-row gap-2 items-baseline' : 'flex-col'}`}
                                                        >
                                                            <div className='font-bold truncate'>
                                                                {
                                                                    activity.label
                                                                }
                                                            </div>
                                                            <div className='opacity-80 font-medium whitespace-nowrap text-[9px]'>
                                                                {activity.start_time.slice(
                                                                    0,
                                                                    5
                                                                )}
                                                                {duration >
                                                                    0.5 &&
                                                                    ` - ${activity.end_time.slice(0, 5)}`}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
}
