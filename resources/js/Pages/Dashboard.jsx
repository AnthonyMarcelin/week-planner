import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { Head, useForm } from '@inertiajs/react';

const timeToNumber = (timeStr) => {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours + (minutes / 60);
};

const HOUR_HEIGHT = 40;

export default function Dashboard({ auth, activities }) {
    const [showModal, setShowModal] = useState(false);
    const [isNightHidden, setIsNightHidden] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedDayMobile, setSelectedDayMobile] = useState(0);

    const startHour = isNightHidden ? 4 : 0;
    const visibleHours = Array.from({ length: 24 - startHour }, (_, i) => i + startHour);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        id: null,
        label: '',
        start_time: '',
        end_time: '',
        type: 'pro',
        days: [],
        day_of_week: null
    });

    const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

    const openCreateModal = () => {
        setIsEditing(false);
        setData({ id: null, label: '', start_time: '', end_time: '', type: 'pro', days: [], day_of_week: null });
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
            day_of_week: activity.day_of_week
        });
        clearErrors();
        setShowModal(true);
    };

    const submit = (e) => {
        e.preventDefault();
        const options = { onSuccess: () => { setShowModal(false); reset(); } };
        if (isEditing) put(`/activities/${data.id}`, options);
        else post('/activities', options);
    };

    const handleDelete = () => {
        if (confirm('Voulez-vous vraiment supprimer cette activité ?')) {
            destroy(`/activities/${data.id}`, { onSuccess: () => { setShowModal(false); reset(); } });
        }
    };

    const handleDayChange = (dayIndex) => {
        const currentDays = data.days;
        setData('days', currentDays.includes(dayIndex) ? currentDays.filter(id => id !== dayIndex) : [...currentDays, dayIndex]);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight">Mon Planning</h2>
                    <div className="flex gap-2 w-full sm:w-auto justify-end">
                        <SecondaryButton onClick={() => setIsNightHidden(!isNightHidden)} className="text-xs">
                            {isNightHidden ? '👁️ 00h+' : '🌙 Cacher'}
                        </SecondaryButton>
                        <PrimaryButton onClick={openCreateModal} className="text-xs">
                            + Activité
                        </PrimaryButton>
                    </div>
                </div>
            }
        >
            <Head title="Planning" />

            <div className="py-6 sm:py-12 bg-slate-50/50 min-h-screen">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    
                    <div className="md:hidden flex overflow-x-auto pb-4 gap-2 px-4">
                        {days.map((day, index) => (
                            <button
                                key={day}
                                onClick={() => setSelectedDayMobile(index)}
                                className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all shadow-sm border
                                    ${selectedDayMobile === index 
                                        ? 'bg-indigo-600 text-white border-indigo-600' 
                                        : 'bg-white text-slate-500 border-slate-200'}`}
                            >
                                {day.slice(0, 3)}
                            </button>
                        ))}
                    </div>

                    <div className="flex bg-white shadow-xl shadow-slate-200/60 sm:rounded-2xl overflow-hidden border border-slate-200">
                        
                        <div className="w-14 sm:w-20 bg-slate-50/50 border-r border-slate-200 pt-[48px] flex-shrink-0">
                            {visibleHours.map(hour => (
                                <div key={hour} className="h-[40px] text-[10px] sm:text-xs text-slate-400 text-center border-b border-slate-100 font-medium flex items-center justify-center">
                                    {hour.toString().padStart(2, '0')}:00
                                </div>
                            ))}
                        </div>

                        <div className="flex-1 grid grid-cols-1 md:grid-cols-7 overflow-hidden md:min-w-[840px] md:overflow-x-auto">
                            {days.map((day, dayIndex) => (
                                <div 
                                    key={day} 
                                    className={`relative border-r border-slate-100 last:border-r-0 ${selectedDayMobile === dayIndex ? 'block' : 'hidden md:block'}`}
                                >
                                    <div className="h-[48px] border-b border-slate-200 bg-slate-50/30 flex items-center justify-center font-bold text-slate-600 text-xs uppercase tracking-widest">
                                        {day}
                                    </div>

                                    <div className="relative">
                                        {visibleHours.map(hour => (
                                            <div key={hour} className="h-[40px] border-b border-slate-50"></div>
                                        ))}

                                        {activities && activities
                                            .filter(a => Number(a.day_of_week) === dayIndex && timeToNumber(a.start_time) >= startHour)
                                            .map((activity) => {
                                                const start = timeToNumber(activity.start_time);
                                                const end = timeToNumber(activity.end_time);
                                                const duration = end - start;

                                                return (
                                                    <div
                                                        key={activity.id}
                                                        onClick={() => openEditModal(activity)}
                                                        className={`absolute left-1 right-1 rounded-md p-2 text-[10px] leading-tight overflow-hidden shadow-sm border-l-4 z-10 cursor-pointer transition-all hover:brightness-95 hover:scale-[1.01]
                                                            ${activity.type === 'pro' 
                                                                ? 'bg-indigo-50 text-indigo-700 border-indigo-500' 
                                                                : 'bg-emerald-50 text-emerald-700 border-emerald-500'}`}
                                                        style={{
                                                            top: `${(start - startHour) * HOUR_HEIGHT}px`,
                                                            height: `${duration * HOUR_HEIGHT}px`,
                                                        }}
                                                    >
                                                        <div className="font-bold truncate">{activity.label}</div>
                                                        <div className="opacity-80 font-medium">
                                                            {activity.start_time.slice(0, 5)} {duration >= 1 && `- ${activity.end_time.slice(0, 5)}`}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={showModal} onClose={() => setShowModal(false)}>
                <form onSubmit={submit} className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-black text-slate-800 tracking-tight">
                            {isEditing ? 'Modifier l\'activité' : 'Nouvelle Activité'}
                        </h2>
                        {isEditing && (
                            <button type="button" onClick={handleDelete} className="text-red-500 hover:text-red-700 text-xs font-bold uppercase tracking-tighter transition">
                                Supprimer
                            </button>
                        )}
                    </div>
                    
                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="label" value="Nom de l'activité" />
                            <TextInput 
                                id="label"
                                value={data.label} 
                                onChange={e => setData('label', e.target.value)} 
                                className="mt-1 block w-full" 
                                placeholder="ex: Réunion Client, Sport..."
                            />
                            <InputError message={errors.label} className="mt-1" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <InputLabel value="⏰ Début" />
                                <TextInput 
                                    type="time" 
                                    value={data.start_time} 
                                    onChange={e => setData('start_time', e.target.value)} 
                                    className="mt-1 block w-full" 
                                />
                                <InputError message={errors.start_time} className="mt-1" />
                            </div>
                            <div>
                                <InputLabel value="🏁 Fin" />
                                <TextInput 
                                    type="time" 
                                    value={data.end_time} 
                                    onChange={e => setData('end_time', e.target.value)} 
                                    className="mt-1 block w-full" 
                                />
                                <InputError message={errors.end_time} className="mt-1" />
                            </div>
                        </div>

                        {!isEditing && (
                            <div>
                                <InputLabel value="Jours de la semaine" className="mb-2" />
                                <div className="flex flex-wrap gap-2">
                                    {days.map((day, index) => (
                                        <button 
                                            key={day} 
                                            type="button" 
                                            onClick={() => handleDayChange(index)} 
                                            className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${data.days.includes(index) ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300'}`}
                                        >
                                            {day.slice(0, 3)}
                                        </button>
                                    ))}
                                </div>
                                <InputError message={errors.days} className="mt-1" />
                            </div>
                        )}

                        <div>
                            <InputLabel value="Catégorie" className="mb-2" />
                            <div className="flex bg-slate-100 p-1 rounded-xl">
                                <button type="button" onClick={() => setData('type', 'pro')} className={`flex-1 py-2 text-xs rounded-lg transition-all ${data.type === 'pro' ? 'bg-white shadow-sm font-bold text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>💼 Professionnel</button>
                                <button type="button" onClick={() => setData('type', 'perso')} className={`flex-1 py-2 text-xs rounded-lg transition-all ${data.type === 'perso' ? 'bg-white shadow-sm font-bold text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}>🏠 Personnel</button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3">
                        <SecondaryButton onClick={() => setShowModal(false)}>Annuler</SecondaryButton>
                        <PrimaryButton disabled={processing}>
                            {isEditing ? 'Mettre à jour' : 'Planifier'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}