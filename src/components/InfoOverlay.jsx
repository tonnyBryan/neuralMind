import { useState, useEffect } from 'react'

export default function InfoOverlay() {
    const [open, setOpen] = useState(false)
    const [visible, setVisible] = useState(false)

    function openModal() {
        setOpen(true)
        setTimeout(() => setVisible(true), 10)
    }

    function closeModal() {
        setVisible(false)
        setTimeout(() => setOpen(false), 300)
    }

    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') closeModal() }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [])

    return (
        <>
            <button
                onClick={openModal}
                className="fixed top-8 right-8 z-50 text-white/30 hover:text-white/70 transition-colors duration-200 bg-transparent border-none cursor-pointer text-lg"
            >
                ℹ
            </button>

            {open && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center px-8"
                    onClick={closeModal}
                    style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.3s ease' }}
                >
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

                    <div
                        className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl px-10 py-8 max-w-md w-full z-10"
                        onClick={e => e.stopPropagation()}
                        style={{
                            opacity: visible ? 1 : 0,
                            transform: visible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.97)',
                            transition: 'opacity 0.35s cubic-bezier(0.22,1,0.36,1), transform 0.35s cubic-bezier(0.22,1,0.36,1)',
                        }}
                    >
                        <button
                            onClick={closeModal}
                            className="absolute top-5 right-6 text-white/30 hover:text-white/70 transition-colors duration-200 bg-transparent border-none cursor-pointer text-xl"
                        >
                            ✕
                        </button>

                        <h2 className="text-white text-2xl font-black tracking-tight mb-2">NeuralMind</h2>
                        <p className="text-white/40 text-xs tracking-widest uppercase mb-6">Cerveau numérique de Tonny Anderson</p>

                        <p className="text-white/60 text-sm font-light leading-relaxed mb-8">
                            NeuralMind est l'alter ego intellectuel de Tonny Anderson —
                            un cerveau IA philosophique qui pense, questionne et répond
                            en temps réel. Pose n'importe quelle question.
                        </p>

                        <div className="border-t border-white/10 mb-6" />

                        <p className="text-white/30 text-xs tracking-widest uppercase mb-3">Stack technique</p>
                        <div className="flex flex-wrap gap-2 mb-8">
                            {['React', 'Three.js', 'Groq API', 'Vite', 'Tailwind CSS'].map(tag => (
                                <span key={tag} className="text-[#fb923c]/80 text-xs border border-[#fb923c]/20 rounded-full px-3 py-1">
                                    {tag}
                                </span>
                            ))}
                        </div>

                        <div className="border-t border-white/10 mb-6" />

                        <p className="text-white/30 text-xs tracking-widest uppercase mb-3">Par</p>
                        <p className="text-white/80 text-sm font-medium mb-4">Tonny Anderson</p>
                        <div className="flex gap-6">
                            <a href="https://tonny-anderson.vercel.app" target="_blank" rel="noopener noreferrer"
                               className="text-white/40 text-sm hover:text-[#fb923c] transition-colors duration-200 group">
                                Portfolio <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
                            </a>
                            <a href="https://github.com/tonnyBryan" target="_blank" rel="noopener noreferrer"
                               className="text-white/40 text-sm hover:text-[#fb923c] transition-colors duration-200 group">
                                GitHub <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}