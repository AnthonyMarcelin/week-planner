import { useState, useMemo } from 'react';
import { Head } from '@inertiajs/react';
import SecondaryButton from '@/Components/SecondaryButton';
import { HOUR_HEIGHT_PUBLIC, timeToNumber } from '@/constants';

export default function PublicPlanner({ profileName, activities }) {
    const [isNightHidden, setIsNightHidden] = useState(true);
    const [selectedDayMobile, setSelectedDayMobile] = useState(0);
    const [weekOffset, setWeekOffset] = useState(0);

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

    const weekDates = useMemo(() => {
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
    }, [weekOffset]);

    return (
        <div className='min-h-screen bg-slate-50/50'>
            <Head title={`Planning de ${profileName}`} />

            <header className='bg-white shadow'>
                <div className='max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8'>
                    <div className='flex flex-col sm:flex-row justify-between items-center gap-4'>
                        <h2 className='text-xl font-bold text-slate-800 tracking-tight'>
                            Planning : {profileName}
                        </h2>

                        <div className='flex items-center bg-white rounded-xl shadow-sm border border-slate-200 p-1'>
                            <button
                                onClick={() =>
                                    setWeekOffset(prev => Math.max(0, prev - 1))
                                }
                                disabled={weekOffset === 0}
                                className='p-2 hover:bg-slate-50 disabled:opacity-30 rounded-lg transition text-slate-600'
                            >
                                ⬅️
                            </button>
                            <span className='px-2 sm:px-4 text-xs sm:text-sm font-bold text-slate-700 w-[180px] sm:w-[220px] text-center truncate'>
                                {weekDates.start} - {weekDates.end}
                            </span>
                            <button
                                onClick={() =>
                                    setWeekOffset(prev => Math.min(3, prev + 1))
                                }
                                disabled={weekOffset === 3}
                                className='p-2 hover:bg-slate-50 disabled:opacity-30 rounded-lg transition text-slate-600'
                            >
                                ➡️
                            </button>
                        </div>

                        <div className='flex gap-2 w-full sm:w-auto justify-end'>
                            <SecondaryButton
                                onClick={() => setIsNightHidden(!isNightHidden)}
                                className='text-xs'
                            >
                                {isNightHidden ? '👁️ 00h+' : '🌙 Cacher'}
                            </SecondaryButton>
                        </div>
                    </div>
                </div>
            </header>

            <main className='py-6 sm:py-12'>
                <div className='mx-auto max-w-7xl sm:px-6 lg:px-8'>
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
                                    onClick={() => setSelectedDayMobile(index)}
                                    className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all shadow-sm border flex flex-col items-center ${
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

                    <div className='flex bg-white shadow-xl shadow-slate-200/60 sm:rounded-2xl overflow-hidden border border-slate-200'>
                        <div className='w-14 sm:w-20 bg-slate-50/50 border-r border-slate-200 pt-[48px] flex-shrink-0'>
                            {visibleHours.map(hour => (
                                <div
                                    key={hour}
                                    className='h-[40px] text-[10px] sm:text-xs text-slate-400 text-center border-b border-slate-100 font-medium flex items-center justify-center'
                                >
                                    {hour.toString().padStart(2, '0')}:00
                                </div>
                            ))}
                        </div>

                        <div className='flex-1 grid grid-cols-1 md:grid-cols-7 overflow-hidden md:min-w-[840px] md:overflow-x-auto'>
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
                                        className={`relative border-r border-slate-100 last:border-r-0 ${selectedDayMobile === dayIndex ? 'block' : 'hidden md:block'}`}
                                    >
                                        <div
                                            className={`h-[48px] border-b border-slate-200 flex flex-col items-center justify-center font-bold text-[10px] uppercase tracking-widest transition-colors ${isToday ? 'bg-indigo-600 text-white shadow-inner' : 'bg-slate-50/30 text-slate-600'}`}
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
                                                    className='h-[40px] border-b border-slate-50'
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
                                                                className={`absolute left-1 right-1 rounded-md p-2 text-[10px] leading-tight overflow-hidden shadow-sm border-l-4 z-10 ${activity.type === 'pro' ? 'bg-indigo-50 text-indigo-700 border-indigo-500' : 'bg-emerald-50 text-emerald-700 border-emerald-500'}`}
                                                                style={{
                                                                    top: `${(start - startHour) * HOUR_HEIGHT_PUBLIC}px`,
                                                                    height: `${duration * HOUR_HEIGHT_PUBLIC}px`,
                                                                }}
                                                            >
                                                                <div className='font-bold truncate'>
                                                                    {
                                                                        activity.label
                                                                    }
                                                                </div>
                                                                <div className='opacity-80 font-medium'>
                                                                    {activity.start_time.slice(
                                                                        0,
                                                                        5
                                                                    )}{' '}
                                                                    {duration >=
                                                                        1 &&
                                                                        `- ${activity.end_time.slice(0, 5)}`}
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
                </div>
            </main>
        </div>
    );
}
