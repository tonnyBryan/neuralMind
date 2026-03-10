import { useState, useRef } from 'react'

const EXAMPLES = [
    { label: "Qui es-tu ?",     text: "C'est qui vraiment Tonny Anderson ?" },
    { label: "Tes projets",     text: "Parle-moi de tes projets les plus marquants." },
    { label: "Philosophie",     text: "Quelle est ta philosophie du code ?" },
    { label: "Code",            text: "Donne-moi un exemple de code que tu aimes écrire." },
    { label: "IA & futur",      text: "Que penses-tu de l'avenir de l'intelligence artificielle ?" },
]

export default function ChatInput({ onSend, disabled = false, showExamples = true, voice = null }) {
    const [value, setValue] = useState('')
    const inputRef = useRef(null)

    function handleSend() {
        if (!value.trim() || disabled) return
        onSend(value.trim())
        setValue('')
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter') handleSend()
    }

    function handleMic() {
        if (!voice) return
        if (voice.listening) {
            voice.stopListening()
            return
        }
        voice.startListening(
            (transcript, isFinal) => {
                setValue(transcript)
                if (isFinal) {
                    // Auto-envoi après silence
                    setTimeout(() => {
                        if (transcript.trim()) {
                            onSend(transcript.trim())
                            setValue('')
                        }
                    }, 400)
                }
            },
            () => {} // onEnd
        )
    }

    const micAvailable = voice?.recognitionSupported
    const isListening = voice?.listening

    return (
        <div className="w-full flex flex-col gap-3">

            {/* Exemples */}
            {showExamples && (
                <div className="flex flex-wrap gap-2">
                    {EXAMPLES.map((example, i) => (
                        <button
                            key={i}
                            onClick={() => { setValue(example.text); inputRef.current?.focus() }}
                            disabled={disabled}
                            className="text-white/30 text-xs border border-white/10 rounded-full px-3 py-1.5 hover:text-white/60 hover:border-white/20 transition-all duration-200 cursor-pointer bg-transparent disabled:opacity-20"
                        >
                            {example.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Input */}
            <div className={`flex items-center gap-3 bg-white/5 backdrop-blur-md border rounded-2xl px-5 py-4 transition-all duration-300 ${
                isListening
                    ? 'border-[#fb923c]/60 shadow-[0_0_20px_rgba(251,146,60,0.15)]'
                    : 'border-white/10 focus-within:border-white/30'
            }`}>
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    placeholder={isListening ? "J'écoute..." : "Pose une question..."}
                    className="flex-1 bg-transparent text-white/80 placeholder-white/25 text-sm outline-none disabled:opacity-40"
                />

                {/* Bouton micro */}
                {micAvailable && (
                    <button
                        onClick={handleMic}
                        disabled={disabled}
                        title={isListening ? "Arrêter" : "Parler"}
                        className="bg-transparent border-none cursor-pointer disabled:opacity-20 transition-all duration-200 flex items-center"
                        style={{ color: isListening ? '#fb923c' : 'rgba(255,255,255,0.25)' }}
                    >
                        {isListening ? (
                            // Pulse animé quand actif
                            <span className="relative flex items-center justify-center w-4 h-4">
                                <span className="absolute w-4 h-4 rounded-full bg-[#fb923c]/30 animate-ping" />
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                    <rect x="9" y="3" width="6" height="11" rx="3"/>
                                    <path d="M5 10a7 7 0 0 0 14 0" fill="none" stroke="currentColor" strokeWidth="2"/>
                                    <line x1="12" y1="19" x2="12" y2="22" stroke="currentColor" strokeWidth="2"/>
                                </svg>
                            </span>
                        ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <rect x="9" y="3" width="6" height="11" rx="3"/>
                                <path d="M5 10a7 7 0 0 0 14 0" fill="none" stroke="currentColor" strokeWidth="2"/>
                                <line x1="12" y1="19" x2="12" y2="22" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                        )}
                    </button>
                )}

                {/* Bouton envoyer */}
                <button
                    onClick={handleSend}
                    disabled={disabled || !value.trim()}
                    className="text-[#fb923c] hover:text-[#fb923c]/70 disabled:opacity-20 transition-colors duration-200 text-lg cursor-pointer bg-transparent border-none"
                >
                    →
                </button>
            </div>

        </div>
    )
}