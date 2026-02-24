import { useState } from 'react';
import { router } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import Checkbox from '@/Components/Checkbox';

export default function AgendasModal({
    showAgendasModal,
    setShowAgendasModal,
    profiles,
    onDeleteAgenda
}) {
    const [newAgendaName, setNewAgendaName] = useState('');
    const [isCreatingAgenda, setIsCreatingAgenda] = useState(false);

    const handleCreateAgenda = () => {
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
    };

    const handleDeleteAgenda = (profileId) => {
        const message = 'Supprimer cet agenda et toutes ses activités ?';
        
        if (confirm(message)) {
            router.delete(`/agendas/${profileId}`, {
                preserveScroll: true,
            });
        }
    };

    return (
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
                    <h3 className='text-lg font-bold text-slate-800 mb-4'>
                        Créer un nouvel agenda
                    </h3>
                    <div className='flex gap-2'>
                        <TextInput
                            value={newAgendaName}
                            onChange={e => setNewAgendaName(e.target.value)}
                            placeholder='Ex: Cours Lycée, Marie...'
                            className='flex-1'
                        />
                        <PrimaryButton
                            onClick={handleCreateAgenda}
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
    );
}
