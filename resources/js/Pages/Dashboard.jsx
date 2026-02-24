import { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { Head, router } from '@inertiajs/react';
import WeekGrid from '@/Components/WeekGrid';
import ActivityForm from '@/Components/ActivityForm';
import AgendasModal from '@/Components/AgendasModal';

export default function Dashboard({
    auth,
    activities,
    profiles = [],
    currentProfileId,
}) {
    const [showModal, setShowModal] = useState(false);
    const [isNightHidden, setIsNightHidden] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedDayMobile, setSelectedDayMobile] = useState(0);
    const [weekOffset, setWeekOffset] = useState(0);
    const [showAgendasModal, setShowAgendasModal] = useState(false);
    const [activityToEdit, setActivityToEdit] = useState(null);

    const handleActivityClick = (activity) => {
        setIsEditing(true);
        setActivityToEdit(activity);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setActivityToEdit(null);
        setIsEditing(false);
    };

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

    if (profiles.length === 0) {
        return null;
    }

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className='flex flex-col gap-4'>
                    <div className='flex flex-col sm:flex-row justify-between items-center gap-4'>
                        <div className='flex items-center gap-2'>
                            <div className='flex items-center gap-1'>
                                <select
                                    value={currentProfileId || ''}
                                    onChange={e => {
                                        router.get(
                                            '/dashboard',
                                            { profile_id: e.target.value },
                                            { preserveState: true }
                                        );
                                    }}
                                    className='text-xl font-bold text-slate-800 tracking-tight bg-transparent border-none focus:ring-0 cursor-pointer hover:bg-slate-100 rounded-lg py-1 pl-2 pr-8'
                                >
                                    {profiles.map(profile => (
                                        <option key={profile.id} value={profile.id}>
                                            {profile.name}
                                        </option>
                                    ))}
                                </select>
                                <span className='text-xs text-slate-400 font-medium'>
                                    ({profiles.find(p => p.id === currentProfileId)?.is_public ? '🌐 Public' : '🔒 Privé'})
                                </span>
                            </div>
                            <button
                                onClick={() => setShowAgendasModal(true)}
                                className='p-2 bg-white border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-50 transition shadow-sm text-sm'
                                title='Gérer les agendas'
                            >
                                👥
                            </button>
                        </div>

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
                            <PrimaryButton
                                onClick={() => {
                                    setIsEditing(false);
                                    setShowModal(true);
                                }}
                                className='text-xs whitespace-nowrap'
                            >
                                + Activité
                            </PrimaryButton>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title='Planning' />

            <div className='py-6 sm:py-12 bg-slate-50/50 min-h-screen'>
                <div className='mx-auto max-w-7xl sm:px-6 lg:px-8'>
                    <WeekGrid
                        activities={activities}
                        profiles={profiles}
                        currentProfileId={currentProfileId}
                        weekOffset={weekOffset}
                        isNightHidden={isNightHidden}
                        selectedDayMobile={selectedDayMobile}
                        onDayMobileChange={setSelectedDayMobile}
                        onActivityClick={handleActivityClick}
                    />
                </div>
            </div>

            <AgendasModal
                showAgendasModal={showAgendasModal}
                setShowAgendasModal={setShowAgendasModal}
                profiles={profiles}
            />

            <ActivityForm
                showModal={showModal}
                setShowModal={handleCloseModal}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                currentProfileId={currentProfileId}
                activityToEdit={activityToEdit}
            />
        </AuthenticatedLayout>
    );
}
