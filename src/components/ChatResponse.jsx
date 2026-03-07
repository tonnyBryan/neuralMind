export default function ChatResponse({ prompt, status, onReset, onDownload }) {
    if (!prompt && status === 'idle') return null

    return (
        <div className="flex flex-col gap-5 w-full">

            {/* Prompt */}
            {prompt && (
                <div>
                    <p className="text-white/30 text-xs tracking-widest uppercase mb-1">Prompt</p>
                    <p className="text-white/70 text-sm font-light leading-relaxed">"{prompt}"</p>
                </div>
            )}

            {/* Thinking */}
            {status === 'thinking' && (
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#fb923c] animate-pulse" />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#fb923c] animate-pulse delay-150" />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#fb923c] animate-pulse delay-300" />
                    </div>
                    <p className="text-white/40 text-xs tracking-widest uppercase">Génération en cours...</p>
                </div>
            )}

            {/* Success */}
            {status === 'success' && (
                <div className="flex flex-col gap-4">
                    <p className="text-[#fb923c]/70 text-xs tracking-widest uppercase">✓ Scène générée</p>
                    <p className="text-white/40 text-xs font-light leading-relaxed">
                        Interact avec la scène à droite — rotation, zoom, déplacement.
                    </p>
                    <div className="flex gap-3 flex-wrap">
                        <button
                            className="text-[#fb923c] text-xs border border-[#fb923c]/30 rounded-full px-4 py-2 hover:bg-[#fb923c]/10 transition-colors duration-200 cursor-pointer bg-transparent"
                            onClick={onDownload}
                        >
                            Télécharger le code →
                        </button>
                        <button
                            className="text-white/40 text-xs border border-white/10 rounded-full px-4 py-2 hover:bg-white/5 transition-colors duration-200 cursor-pointer bg-transparent"
                            onClick={onReset}
                        >
                            Nouvelle scène
                        </button>
                    </div>
                </div>
            )}

            {/* Error */}
            {status === 'error' && (
                <div className="flex flex-col gap-4">
                    <p className="text-red-400/60 text-xs tracking-widest uppercase">✕ Génération échouée</p>
                    <p className="text-white/30 text-xs font-light">Le cerveau n'a pas pu générer cette scène. Réessaie avec un prompt différent.</p>
                    <button
                        className="text-white/40 text-xs border border-white/10 rounded-full px-4 py-2 hover:bg-white/5 transition-colors duration-200 cursor-pointer bg-transparent w-fit"
                        onClick={onReset}
                    >
                        Réessayer
                    </button>
                </div>
            )}

        </div>
    )
}