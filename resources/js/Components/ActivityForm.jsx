import { useState, useEffect } from 'react';
import { useForm, router } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import Checkbox from '@/Components/Checkbox';

export default function ActivityForm({
    showModal,
    setShowModal,
    isEditing,
    setIsEditing,
    currentProfileId,
    activityToEdit
}) {
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

    useEffect(() => {
        setData('profile_id', currentProfileId);
    }, [currentProfileId, setData]);

    useEffect(() => {
        if (activityToEdit && isEditing) {
            setData({
                id: activityToEdit.id,
                label: activityToEdit.label,
                start_time: activityToEdit.start_time.slice(0, 5),
                end_time: activityToEdit.end_time.slice(0, 5),
                type: activityToEdit.type,
                days: [],
                day_of_week: activityToEdit.day_of_week,
                group_id: activityToEdit.group_id,
                scope: 'single',
                profile_id: currentProfileId,
            });
        }
    }, [activityToEdit, isEditing, currentProfileId, setData]);

    const days = [
        'Lundi',
        'Mardi',
        'Mercredi',
        'Jeudi',
        'Vendredi',
        'Samedi',
        'Dimanche',
    ];

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

    const openEditModal = (activity) => {
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

    const handleSubmit = (e) => {
        e.preventDefault();
        const options = {
            onSuccess: () => {
                setShowModal(false);
                reset();
            },
        };

        if (isEditing) {
            router.patch(`/activities/${data.id}`, data, options);
        } else {
            post('/activities', options);
        }
    };

    const handleDelete = (onDelete) => {
        const message =
            data.scope === 'series'
                ? 'Voulez-vous vraiment supprimer TOUTE la série (4 semaines) ?'
                : 'Voulez-vous vraiment supprimer UNIQUEMENT cette activité ?';

        if (confirm(message)) {
            destroy(`/activities/${data.id}`, {
                data: { scope: data.scope },
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                },
            });
        }
    };

    const handleDayChange = (dayIndex) => {
        const currentDays = data.days;
        setData(
            'days',
            currentDays.includes(dayIndex)
                ? currentDays.filter(id => id !== dayIndex)
                : [...currentDays, dayIndex]
        );
    };

    return (
        <Modal show={showModal} onClose={() => setShowModal(false)}>
            <form onSubmit={handleSubmit} className='p-6'>
                <div className='flex justify-between items-center mb-6'>
                    <h2 className='text-xl font-black text-slate-800 tracking-tight'>
                        {isEditing
                            ? "Modifier l'activité"
                            : 'Nouvelle Activité'}
                    </h2>
                    {isEditing && (
                        <button
                            type='button'
                            onClick={() => handleDelete()}
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
    );
}
