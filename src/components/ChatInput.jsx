import { useState, useEffect } from 'react'

const EXAMPLES = [
    { label: "Qui es-tu ?",   text: "C'est qui vraiment Tonny Anderson ?" },
    { label: "Tes projets",   text: "Parle-moi de tes projets les plus marquants." },
    { label: "Philosophie",   text: "Quelle est ta philosophie du code ?" },
    { label: "Code",          text: "Donne-moi un exemple de code que tu aimes écrire." },
    { label: "IA & futur",    text: "Que penses-tu de l'avenir de l'intelligence artificielle ?" },
]

const TOOLTIP_KEY = 'neuralmind_voice_tooltip_seen'

export default function ChatInput({ onSend, disabled = false, showExamples = true, voiceMode = false, onToggleVoice }) {
    const [value, setValue] = useState('')
    const [showTooltip, setShowTooltip] = useState(false)

    useEffect(() => {
        // Afficher le tooltip seulement si jamais vu
        const seen = localStorage.getItem(TOOLTIP_KEY)
        if (!seen) {
            const t1 = setTimeout(() => setShowTooltip(true), 800)
            const t2 = setTimeout(() => {
                setShowTooltip(false)
                localStorage.setItem(TOOLTIP_KEY, '1')
            }, 5500)
            return () => { clearTimeout(t1); clearTimeout(t2) }
        }
    }, [])

    function handleSend() {
        if (!value.trim() || disabled) return
        onSend(value.trim())
        setValue('')
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter') handleSend()
    }

    function handleVoiceClick() {
        // Cacher le tooltip si on clique sur le micro
        if (showTooltip) {
            setShowTooltip(false)
            localStorage.setItem(TOOLTIP_KEY, '1')
        }
        onToggleVoice?.()
    }

    return (
        <div className="w-full flex flex-col gap-3">

            {/* Exemples */}
            {showExamples && (
                <div className="flex flex-wrap gap-2">
                    {EXAMPLES.map((example, i) => (
                        <button
                            key={i}
                            onClick={() => setValue(example.text)}
                            disabled={disabled}
                            className="text-white/30 text-xs border border-white/10 rounded-full px-3 py-1.5 hover:text-white/60 hover:border-white/20 transition-all duration-200 cursor-pointer bg-transparent disabled:opacity-20"
                        >
                            {example.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Input */}
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-5 h-14 focus-within:border-white/30 transition-all duration-300"
                 style={{ borderColor: voiceMode ? 'rgba(251,146,60,0.3)' : undefined }}
            >
                <input
                    type="text"
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    placeholder={voiceMode ? "Mode vocal activé — pose une question..." : "Pose une question..."}
                    className="flex-1 bg-transparent text-white/80 placeholder-white/25 text-sm outline-none disabled:opacity-40"
                />

                {/* Bouton micro avec tooltip */}
                {onToggleVoice && (
                    <div className="relative flex-shrink-0">

                        {/* Tooltip */}
                        <div
                            style={{
                                position: 'absolute',
                                bottom: 'calc(100% + 12px)',
                                right: '-4px',
                                pointerEvents: 'none',
                                opacity: showTooltip ? 1 : 0,
                                transform: showTooltip ? 'translateY(0)' : 'translateY(6px)',
                                transition: 'opacity 0.4s ease, transform 0.4s ease',
                                whiteSpace: 'nowrap',
                                zIndex: 50,
                            }}
                        >
                            <div style={{
                                background: 'rgba(251,146,60,0.12)',
                                border: '1px solid rgba(251,146,60,0.3)',
                                borderRadius: '10px',
                                padding: '7px 12px',
                                backdropFilter: 'blur(12px)',
                            }}>
                                <p style={{ color: 'rgba(251,146,60,0.9)', fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.01em' }}>
                                    ✨ Essaie le mode vocal
                                </p>
                            </div>
                            {/* Flèche vers le bas */}
                            <div style={{
                                position: 'absolute',
                                bottom: '-5px',
                                right: '14px',
                                width: '8px',
                                height: '8px',
                                background: 'rgba(251,146,60,0.12)',
                                border: '1px solid rgba(251,146,60,0.3)',
                                borderTop: 'none',
                                borderLeft: 'none',
                                transform: 'rotate(45deg)',
                            }} />
                        </div>

                        {/* Ring pulsant quand voix activée */}
                        {voiceMode && (
                            <span className="absolute inset-0 rounded-full animate-ping"
                                  style={{ background: 'rgba(251,146,60,0.15)', animationDuration: '1.5s' }}
                            />
                        )}

                        {/* Bouton micro */}
                        <button
                            onClick={handleVoiceClick}
                            title={voiceMode ? "Désactiver la voix" : "Activer le mode vocal"}
                            className="relative flex items-center justify-center w-7 h-7 rounded-full transition-all duration-200 cursor-pointer border-none"
                            style={{
                                background: voiceMode ? 'rgba(251,146,60,0.15)' : 'transparent',
                                color: voiceMode ? '#fb923c' : 'rgba(255,255,255,0.25)',
                            }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="9" y="2" width="6" height="12" rx="3"/>
                                <path d="M5 10a7 7 0 0 0 14 0"/>
                                <line x1="12" y1="19" x2="12" y2="22"/>
                                <line x1="9" y1="22" x2="15" y2="22"/>
                            </svg>
                        </button>
                    </div>
                )}

                {/* Bouton envoyer */}
                <button
                    onClick={handleSend}
                    disabled={disabled || !value.trim()}
                    className="text-[#fb923c] hover:text-[#fb923c]/70 disabled:opacity-20 transition-colors duration-200 text-lg cursor-pointer bg-transparent border-none flex-shrink-0"
                >
                    →
                </button>
            </div>

        </div>
    )
}