import { useState } from 'react'

const EXAMPLES = [
    { label: "Qui es-tu ?",     text: "C'est qui vraiment Tonny Anderson ?" },
    { label: "Tes projets",     text: "Parle-moi de tes projets les plus marquants." },
    { label: "Philosophie",     text: "Quelle est ta philosophie du code ?" },
    { label: "Code",            text: "Donne-moi un exemple de code que tu aimes écrire." },
    { label: "IA & futur",      text: "Que penses-tu de l'avenir de l'intelligence artificielle ?" },
]

export default function ChatInput({ onSend, disabled = false, showExamples = true }) {
    const [value, setValue] = useState('')

    function handleSend() {
        if (!value.trim() || disabled) return
        onSend(value.trim())
        setValue('')
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter') handleSend()
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
            <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-5 py-4 focus-within:border-white/30 transition-all duration-300">
                <input
                    type="text"
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    placeholder="Pose une question..."
                    className="flex-1 bg-transparent text-white/80 placeholder-white/25 text-sm outline-none disabled:opacity-40"
                />
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