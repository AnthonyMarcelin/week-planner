import { Head, Link } from '@inertiajs/react';

export default function Welcome({ auth }) {
    return (
        <>
            <Head title="Week-Planner" />
            <div className="relative min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-500 selection:text-white overflow-hidden">
                
                <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-50">
                    <div className="text-2xl font-black tracking-tighter text-indigo-600">
                        Week-Planner
                    </div>
                    <div>
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="font-semibold text-sm text-slate-600 hover:text-indigo-600 transition"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <div className="flex gap-6 items-center">
                                <Link
                                    href={route('login')}
                                    className="font-semibold text-sm text-slate-600 hover:text-indigo-600 transition"
                                >
                                    Login
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="font-semibold text-sm bg-slate-900 text-white px-5 py-2.5 rounded-full hover:bg-slate-700 transition"
                                >
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                <div className="relative flex flex-col items-center justify-center pt-32 pb-16 lg:pt-48 lg:pb-32 px-4">
                    <div className="text-center max-w-3xl mx-auto space-y-6 z-10">
                        
                        {/* Titre Principal */}
                        <h1 className="text-6xl lg:text-8xl font-black tracking-tight text-slate-900 leading-[1.1]">
                            Own your <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500">
                                entire month.
                            </span>
                        </h1>

                        {/* Description mise à jour avec la mention des 4 semaines */}
                        <p className="text-xl text-slate-500 max-w-xl mx-auto leading-relaxed">
                            Stop living day-to-day. Plan your professional and personal life with our new <strong>4-week vision</strong>. Simple, clutter-free, and efficient.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                            <Link
                                href={route('register')}
                                className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-indigo-600 rounded-full hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 hover:shadow-indigo-300 transform hover:-translate-y-1"
                            >
                                Start Planning Free
                            </Link>
                        </div>
                    </div>

                    {/* Illustration 3D CSS */}
                    <div className="mt-20 relative w-full max-w-5xl perspective-1000">
                        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-20 h-full w-full"></div>
                        <div className="relative bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden transform rotate-x-12 scale-95 opacity-90 hover:opacity-100 hover:rotate-x-0 hover:scale-100 transition duration-700 ease-out">
                            <div className="h-12 bg-slate-50 border-b border-slate-200 flex items-center px-4 gap-2">
                                <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                                <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                            </div>
                            <div className="grid grid-cols-7 h-[400px] divide-x divide-slate-100 bg-slate-50/30">
                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                                    <div key={day} className="flex flex-col relative">
                                        <div className="p-4 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">{day}</div>
                                        {i === 1 && (
                                            <div className="absolute top-20 left-2 right-2 bg-indigo-100 border-l-4 border-indigo-500 p-2 rounded text-xs text-indigo-700 shadow-sm">
                                                <div className="font-bold">Deep Work</div>
                                                <div className="opacity-75">09:00 - 12:00</div>
                                            </div>
                                        )}
                                        {i === 2 && (
                                            <div className="absolute top-40 left-2 right-2 bg-emerald-100 border-l-4 border-emerald-500 p-2 rounded text-xs text-emerald-700 shadow-sm">
                                                <div className="font-bold">Sport</div>
                                                <div className="opacity-75">12:30 - 14:00</div>
                                            </div>
                                        )}
                                        {i === 3 && (
                                            <>
                                                <div className="absolute top-16 left-2 right-2 bg-indigo-100 border-l-4 border-indigo-500 p-2 rounded text-xs text-indigo-700 shadow-sm">
                                                    <div className="font-bold">Client Meeting</div>
                                                </div>
                                                <div className="absolute top-36 left-2 right-2 bg-slate-100 border-l-4 border-slate-400 p-2 rounded text-xs text-slate-600 shadow-sm opacity-60">
                                                    <div className="font-bold">Review</div>
                                                </div>
                                            </>
                                        )}
                                        {i === 5 && (
                                            <div className="absolute top-28 left-2 right-2 bg-amber-100 border-l-4 border-amber-500 p-2 rounded text-xs text-amber-700 shadow-sm">
                                                <div className="font-bold">Family Time</div>
                                                <div className="opacity-75">10:00 - 18:00</div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Arrière-plan animé */}
                <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

                <footer className="relative py-8 text-center text-sm text-slate-400">
                    <p>&copy; 2026 Week-Planner Inc. All rights reserved.</p>
                </footer>
            </div>
            
            <style>{`
                .perspective-1000 { perspective: 1000px; }
                .rotate-x-12 { transform: rotateX(12deg); }
                .rotate-x-0 { transform: rotateX(0deg); }
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-blob { animation: blob 7s infinite; }
                .animation-delay-2000 { animation-delay: 2s; }
                .animation-delay-4000 { animation-delay: 4s; }
            `}</style>
        </>
    );
}