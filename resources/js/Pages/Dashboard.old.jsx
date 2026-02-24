import { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import Checkbox from '@/Components/Checkbox';
import { Head, useForm, router } from '@inertiajs/react';

const timeToNumber = timeStr => {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours + minutes / 60;
};

const HOUR_HEIGHT = 60;

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
    const [newAgendaName, setNewAgendaName] = useState('');
    const [isCreatingAgenda, setIsCreatingAgenda] = useState(false);
    
    // Confirmation modals
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [showDeleteAgendaConfirmModal, setShowDeleteAgendaConfirmModal] = useState(false);
    const [deleteConfirmMessage, setDeleteConfirmMessage] = useState('');
    const [pendingDeleteAction, setPendingDeleteAction] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const startHour = isNightHidden ? 4 : 0;
    const visibleHours = Array.from(
        { length: 24 - startHour },
        (_, i) => i + startHour
    );

    const {
        data,
        setData,
        post,
        put,
        delete: destroy,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm({
        id: null,
        label: '',
        start_time: '',
        end_time: '',
        type: 'pro',
        days: [],
        day_of_week: null,
        group_id: null,
        scope: 'single',
        profile_id: currentProfileId,
    });

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

    const openCreateModal = () => {
        setIsEditing(false);
        setData({
            id: null,
            label: '',
            start_time: '',
            end_time: '',
            type: 'pro',
            days: [],
            day_of_week: null,
            group_id: null,
            scope: 'series',
            profile_id: currentProfileId,
        });
        clearErrors();
        setShowModal(true);
    };

    const openEditModal = activity => {
        setIsEditing(true);
        setData({
            id: activity.id,
            label: activity.label,
            start_time: activity.start_time.slice(0, 5),
            end_time: activity.end_time.slice(0, 5),
            type: activity.type,
            days: [],
            day_of_week: activity.day_of_week,
            group_id: activity.group_id,
            scope: 'single',
            profile_id: currentProfileId,
        });
        clearErrors();
        setShowModal(true);
    };

    const submit = e => {
        e.preventDefault();
        const options = {
            onSuccess: () => {
                setShowModal(false);
                reset();
            },
        };

        if (isEditing) {
            put(`/activities/${data.id}`, options);
        } else {
            post('/activities', options);
        }
    };

    const handleDelete = () => {
        const message =
            data.scope === 'series'
                ? 'Voulez-vous vraiment supprimer TOUTE la série (4 semaines) ?'
                : 'Voulez-vous vraiment supprimer UNIQUEMENT cette activité ?';

        setDeleteConfirmMessage(message);
        setPendingDeleteAction(() => () => {
            setIsDeleting(true);
            destroy(`/activities/${data.id}`, {
                data: { scope: data.scope },
                onSuccess: () => {
                    setShowModal(false);
                    setShowDeleteConfirmModal(false);
                    reset();
                    setIsDeleting(false);
                },
                onError: () => {
                    setIsDeleting(false);
                },
            });
        });
        setShowDeleteConfirmModal(true);
    };

    const handleDeleteAgenda = (profileId) => {
        setDeleteConfirmMessage('Supprimer cet agenda et toutes ses activités ?');
        setPendingDeleteAction(() => () => {
            setIsDeleting(true);
            router.delete(`/agendas/${profileId}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setShowDeleteAgendaConfirmModal(false);
                    setIsDeleting(false);
                },
                onError: () => {
                    setIsDeleting(false);
                },
            });
        });
        setShowDeleteAgendaConfirmModal(true);
    };

    const handleDayChange = dayIndex => {
        const currentDays = data.days;
        setData(
            'days',
            currentDays.includes(dayIndex)
                ? currentDays.filter(id => id !== dayIndex)
                : [...currentDays, dayIndex]
        );
    };

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
                                onClick={openCreateModal}
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

                    {/* Affichage mobile du jour sélectionné */}
                    <div className='md:hidden bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4'>
                        <div className='flex items-center justify-between'>
                            <span className='font-bold text-yellow-800'>
                                {days[selectedDayMobile]} - {new Date(weekDates.mondayObject).getDate() + selectedDayMobile}
                            </span>
                            <button
                                onClick={() => setSelectedDayMobile((prev) => (prev + 1) % 7)}
                                className='text-yellow-600 hover:text-yellow-800 text-sm'
                            >
                                Jour suivant →
                            </button>
                        </div>
                    </div>

                    <div className='flex bg-white shadow-xl shadow-slate-200/60 sm:rounded-2xl overflow-hidden border border-slate-200'>
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
                                                                    openEditModal(
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
                                                                    top: `${(start - startHour) * HOUR_HEIGHT}px`,
                                                                    height: `${duration * HOUR_HEIGHT}px`,
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
                </div>
            </div>

            <Modal show={showModal} onClose={() => setShowModal(false)}>
                <form onSubmit={submit} className='p-6'>
                    <div className='flex justify-between items-center mb-6'>
                        <h2 className='text-xl font-black text-slate-800 tracking-tight'>
                            {isEditing
                                ? "Modifier l'activité"
                                : 'Nouvelle Activité'}
                        </h2>
                        {isEditing && (
                            <button
                                type='button'
                                onClick={handleDelete}
                                className='text-red-500 hover:text-red-700 text-xs font-bold uppercase tracking-tighter transition'
                            >
                                Supprimer
                            </button>
                        )}
                    </div>

                    <div className='space-y-4'>
                        <div>
                            <InputLabel
                                htmlFor='label'
                                value="Nom de l'activité"
                            />
                            <TextInput
                                id='label'
                                value={data.label}
                                onChange={e => setData('label', e.target.value)}
                                className='mt-1 block w-full'
                                placeholder='ex: Réunion Client, Sport...'
                            />
                            <InputError
                                message={errors.label}
                                className='mt-1'
                            />
                        </div>

                        <div className='grid grid-cols-2 gap-4'>
                            <div>
                                <InputLabel value='⏰ Début' />
                                <TextInput
                                    type='time'
                                    value={data.start_time}
                                    onChange={e =>
                                        setData('start_time', e.target.value)
                                    }
                                    className='mt-1 block w-full'
                                />
                                <InputError
                                    message={errors.start_time}
                                    className='mt-1'
                                />
                            </div>
                            <div>
                                <InputLabel value='🏁 Fin' />
                                <TextInput
                                    type='time'
                                    value={data.end_time}
                                    onChange={e =>
                                        setData('end_time', e.target.value)
                                    }
                                    className='mt-1 block w-full'
                                />
                                <InputError
                                    message={errors.end_time}
                                    className='mt-1'
                                />
                            </div>
                        </div>

                        {isEditing && data.group_id && (
                            <div className='p-3 bg-indigo-50 rounded-lg border border-indigo-100'>
                                <label className='flex items-center'>
                                    <Checkbox
                                        name='scope'
                                        checked={data.scope === 'series'}
                                        onChange={e =>
                                            setData(
                                                'scope',
                                                e.target.checked
                                                    ? 'series'
                                                    : 'single'
                                            )
                                        }
                                    />
                                    <span className='ms-2 text-sm text-indigo-900 font-medium'>
                                        Appliquer aux 4 semaines
                                    </span>
                                </label>
                                <p className='text-[10px] text-indigo-600 mt-1 ml-6'>
                                    Si coché, la modification ou la suppression
                                    s'appliquera à toute la série.
                                </p>
                            </div>
                        )}

                        {!isEditing && (
                            <div>
                                <InputLabel
                                    value='Jours de la semaine'
                                    className='mb-2'
                                />
                                <div className='flex flex-wrap gap-2'>
                                    {days.map((day, index) => (
                                        <button
                                            key={day}
                                            type='button'
                                            onClick={() =>
                                                handleDayChange(index)
                                            }
                                            className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${data.days.includes(index) ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300'}`}
                                        >
                                            {day.slice(0, 3)}
                                        </button>
                                    ))}
                                </div>
                                <p className='text-[10px] text-slate-400 mt-1 italic'>
                                    Créera automatiquement l'activité pour les 4
                                    semaines à venir.
                                </p>
                                <InputError
                                    message={errors.days}
                                    className='mt-1'
                                />
                            </div>
                        )}

                        <div>
                            <InputLabel value='Catégorie' className='mb-2' />
                            <div className='flex bg-slate-100 p-1 rounded-xl'>
                                <button
                                    type='button'
                                    onClick={() => setData('type', 'pro')}
                                    className={`flex-1 py-2 text-xs rounded-lg transition-all ${data.type === 'pro' ? 'bg-white shadow-sm font-bold text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    💼 Professionnel
                                </button>
                                <button
                                    type='button'
                                    onClick={() => setData('type', 'perso')}
                                    className={`flex-1 py-2 text-xs rounded-lg transition-all ${data.type === 'perso' ? 'bg-white shadow-sm font-bold text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    🏠 Personnel
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className='mt-8 flex justify-end gap-3'>
                        <SecondaryButton onClick={() => setShowModal(false)}>
                            Annuler
                        </SecondaryButton>
                        <PrimaryButton disabled={processing}>
                            {isEditing ? 'Mettre à jour' : 'Planifier'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            <Modal
                show={showAgendasModal}
                onClose={() => setShowAgendasModal(false)}
            >
                <div className='p-6'>
                    <h2 className='text-xl font-black text-slate-800 tracking-tight mb-6'>
                        Gérer mes Agendas
                    </h2>

                    <div className='space-y-4 mb-8'>
                        {profiles.map(profile => (
                            <div
                                key={profile.id}
                                className='p-4 border border-slate-200 rounded-xl bg-slate-50 flex flex-col sm:flex-row gap-4 justify-between sm:items-center'
                            >
                                <div className='flex-1'>
                                    <div className='flex items-center gap-2 mb-2'>
                                        <div className='flex-1 flex items-center gap-2'>
                                            <input
                                                type='text'
                                                defaultValue={profile.name}
                                                onBlur={e => {
                                                    if (
                                                        e.target.value !== profile.name
                                                    ) {
                                                        router.put(
                                                            `/agendas/${profile.id}`,
                                                            {
                                                                name: e.target.value,
                                                                is_public:
                                                                    profile.is_public,
                                                            },
                                                            { preserveScroll: true }
                                                        );
                                                    }
                                                }}
                                                className='font-bold text-slate-800 bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full'
                                                placeholder='Nom de l&#39;agenda'
                                            />
                                            <span className='text-xs text-slate-400 font-medium whitespace-nowrap'>
                                                {profile.is_public ? '🌐 Public' : '🔒 Privé'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className='flex items-center mt-2 gap-2'>
                                        <label className='flex items-center text-xs text-slate-600 cursor-pointer'>
                                            <Checkbox
                                                checked={
                                                    profile.is_public === 1 ||
                                                    profile.is_public === true
                                                }
                                                onChange={e =>
                                                    router.put(
                                                        `/agendas/${profile.id}`,
                                                        {
                                                            name: profile.name,
                                                            is_public:
                                                                e.target
                                                                    .checked,
                                                        },
                                                        { preserveScroll: true }
                                                    )
                                                }
                                            />
                                            <span className='ml-2'>
                                                Lien public activé
                                            </span>
                                        </label>
                                    </div>
                                </div>

                                <div className='flex items-center gap-2'>
                                    {(profile.is_public === 1 ||
                                        profile.is_public === true) && (
                                        <>
                                            <a
                                                href={`/view/${profile.slug}`}
                                                target='_blank'
                                                rel='noreferrer'
                                                className='text-xs bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-200 transition'
                                            >
                                                👀 Voir
                                            </a>
                                            <button
                                                onClick={() => {
                                                    const url = `${window.location.origin}/view/${profile.slug}`;
                                                    if (
                                                        navigator.clipboard &&
                                                        window.isSecureContext
                                                    ) {
                                                        navigator.clipboard.writeText(
                                                            url
                                                        );
                                                        alert(
                                                            'Lien public copié !'
                                                        );
                                                    } else {
                                                        prompt(
                                                            'Copiez manuellement ce lien :',
                                                            url
                                                        );
                                                    }
                                                }}
                                                className='text-xs bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg font-bold hover:bg-emerald-200 transition'
                                            >
                                                🔗 Copier
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={() => handleDeleteAgenda(profile.id)}
                                        className='text-xs text-red-500 hover:text-red-700 font-bold p-2'
                                        disabled={profiles.length <= 1}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className='border-t border-slate-200 pt-6'>
                        <h3 className='text-sm font-bold text-slate-800 mb-3'>
                            Nouvel agenda
                        </h3>
                        <div className='flex gap-2'>
                            <TextInput
                                value={newAgendaName}
                                onChange={e => setNewAgendaName(e.target.value)}
                                placeholder='Ex: Cours Lycée, Marie...'
                                className='flex-1'
                            />
                            <PrimaryButton
                                onClick={() => {
                                    if (!newAgendaName.trim()) return;
                                    
                                    setIsCreatingAgenda(true);
                                    router.post(
                                        '/agendas',
                                        { name: newAgendaName },
                                        {
                                            onSuccess: () => {
                                                setNewAgendaName('');
                                                setIsCreatingAgenda(false);
                                            },
                                            onError: () => {
                                                setIsCreatingAgenda(false);
                                            }
                                        }
                                    );
                                }}
                                disabled={!newAgendaName.trim() || isCreatingAgenda}
                            >
                                {isCreatingAgenda ? (
                                    <span className='flex items-center gap-2'>
                                        <svg className='animate-spin h-4 w-4' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                                            <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                                            <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                                        </svg>
                                        Création...
                                    </span>
                                ) : (
                                    'Ajouter'
                                )}
                            </PrimaryButton>
                        </div>
                    </div>

                    <div className='mt-6 flex justify-end'>
                        <SecondaryButton
                            onClick={() => setShowAgendasModal(false)}
                        >
                            Fermer
                        </SecondaryButton>
                    </div>
                </div>
            </Modal>

            {/* Confirmation Modal for Activity Delete */}
            <Modal show={showDeleteConfirmModal} onClose={() => setShowDeleteConfirmModal(false)}>
                <div className='p-6'>
                    <div className='flex items-center mb-4'>
                        <div className='w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4'>
                            <span className='text-red-600 text-xl'>⚠️</span>
                        </div>
                        <h3 className='text-lg font-bold text-slate-800'>Confirmation de suppression</h3>
                    </div>
                    
                    <p className='text-slate-600 mb-6'>{deleteConfirmMessage}</p>
                    
                    <div className='flex justify-end gap-3'>
                        <SecondaryButton onClick={() => setShowDeleteConfirmModal(false)}>
                            Annuler
                        </SecondaryButton>
                        <PrimaryButton
                            onClick={() => pendingDeleteAction && pendingDeleteAction()}
                            disabled={isDeleting}
                            className='bg-red-600 hover:bg-red-700 focus:bg-red-700'
                        >
                            {isDeleting ? (
                                <span className='flex items-center gap-2'>
                                    <svg className='animate-spin h-4 w-4' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                                        <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                                        <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                                    </svg>
                                    Suppression...
                                </span>
                            ) : (
                                'Supprimer'
                            )}
                        </PrimaryButton>
                    </div>
                </div>
            </Modal>

            {/* Confirmation Modal for Agenda Delete */}
            <Modal show={showDeleteAgendaConfirmModal} onClose={() => setShowDeleteAgendaConfirmModal(false)}>
                <div className='p-6'>
                    <div className='flex items-center mb-4'>
                        <div className='w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4'>
                            <span className='text-red-600 text-xl'>⚠️</span>
                        </div>
                        <h3 className='text-lg font-bold text-slate-800'>Confirmation de suppression</h3>
                    </div>
                    
                    <p className='text-slate-600 mb-6'>{deleteConfirmMessage}</p>
                    
                    <div className='flex justify-end gap-3'>
                        <SecondaryButton onClick={() => setShowDeleteAgendaConfirmModal(false)}>
                            Annuler
                        </SecondaryButton>
                        <PrimaryButton
                            onClick={() => pendingDeleteAction && pendingDeleteAction()}
                            disabled={isDeleting}
                            className='bg-red-600 hover:bg-red-700 focus:bg-red-700'
                        >
                            {isDeleting ? (
                                <span className='flex items-center gap-2'>
                                    <svg className='animate-spin h-4 w-4' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                                        <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                                        <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                                    </svg>
                                    Suppression...
                                </span>
                            ) : (
                                'Supprimer'
                            )}
                        </PrimaryButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
