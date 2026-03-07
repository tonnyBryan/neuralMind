import { useEffect, useRef, useState } from 'react'
import { parseMessage } from '../utils/parseMessage.js'

const EMOTION_COLORS = {
    calm:      'text-blue-300/80',
    intense:   'text-red-300/80',
    positive:  'text-green-300/80',
    technical: 'text-orange-300/80',
}

function MessageContent({ content, isStreaming }) {
    const segments = parseMessage(content)

    return (
        <p className="leading-relaxed">
            {segments.map((seg, i) => {
                if (seg.type === 'big') return (
                    <span key={i} style={{ display: 'block', fontSize: '1.25rem', fontWeight: 900, color: 'white', marginBottom: '10px', lineHeight: 1.3, letterSpacing: '-0.02em' }}>
                        {seg.content}
                    </span>
                )
                if (seg.type === 'key') return (
                    <span key={i} className="text-[#fb923c] font-medium">{seg.content}</span>
                )
                if (seg.type === 'soft') return (
                    <span key={i} style={{ display: 'block', fontSize: '0.75rem', fontStyle: 'italic', color: 'rgba(255,255,255,0.4)', marginTop: '10px', lineHeight: 1.6 }}>
                        {seg.content}
                    </span>
                )
                return (
                    <span key={i} className="text-white/85 text-sm font-light">{seg.content}</span>
                )
            })}
            {isStreaming && (
                <span className="inline-block w-0.5 h-3.5 bg-[#fb923c] ml-0.5 align-middle animate-pulse" />
            )}
        </p>
    )
}

export default function ChatWindow({ messages, isStreaming, suggestions, onSuggestion }) {
    const bottomRef = useRef(null)
    const containerRef = useRef(null)
    const [userScrolledUp, setUserScrolledUp] = useState(false)

    function handleScroll() {
        const el = containerRef.current
        if (!el) return
        const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
        setUserScrolledUp(distanceFromBottom > 80)
    }

    useEffect(() => {
        if (!userScrolledUp) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages, userScrolledUp])

    if (messages.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-start justify-center gap-4">
                <p className="text-white/40 text-xs tracking-widest uppercase">NeuralMind</p>
                <p className="text-white/60 text-2xl font-light leading-snug max-w-xs">
                    Pose-moi une question.<br />N'importe laquelle.
                </p>
            </div>
        )
    }

    return (
        <div
            ref={containerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto flex flex-col gap-8 py-4 pr-1"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
            <style>{`div::-webkit-scrollbar { display: none; }`}</style>

            {messages.map((msg, i) => {
                const isLastAssistant = msg.role === 'assistant' && i === messages.length - 1
                const isStreamed = isLastAssistant && isStreaming

                return (
                    <div key={i} className="flex flex-col gap-1">
                        <p className="text-white/40 text-xs tracking-widest uppercase mb-2">
                            {msg.role === 'user' ? 'Vous' : 'NeuralMind'}
                        </p>

                        {msg.role === 'user' ? (
                            <p className="text-white/60 text-sm font-light leading-relaxed">
                                {msg.content}
                            </p>
                        ) : (
                            <MessageContent content={msg.content} isStreaming={isStreamed} />
                        )}

                        {msg.role === 'assistant' && msg.emotion && (
                            <p className={`text-xs mt-2 font-medium ${EMOTION_COLORS[msg.emotion] || 'text-white/50'}`}>
                                ◆ {msg.emotion}
                            </p>
                        )}
                    </div>
                )
            })}

            {!isStreaming && suggestions.length > 0 && (
                <div className="flex flex-col gap-2">
                    <p className="text-white/40 text-xs tracking-widest uppercase">Continuer</p>
                    <div className="flex flex-col gap-2">
                        {suggestions.map((s, i) => (
                            <button
                                key={i}
                                onClick={() => onSuggestion(s)}
                                className="text-left text-white/60 text-xs border border-white/20 rounded-xl px-4 py-2.5 hover:text-white/90 hover:border-white/40 transition-all duration-200 cursor-pointer bg-transparent"
                            >
                                {s} →
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div ref={bottomRef} />
        </div>
    )
}