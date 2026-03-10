import { useEffect, useRef, useState } from 'react'
import { marked } from 'marked'

const EMOTION_COLORS = {
    calm:      'text-blue-300/80',
    intense:   'text-red-300/80',
    positive:  'text-green-300/80',
    technical: 'text-orange-300/80',
}

marked.setOptions({ breaks: true, gfm: true })

const NM_STYLES = `
.nm-content p { color: rgba(255,255,255,0.85); font-size: 0.875rem; font-weight: 300; line-height: 1.7; margin: 0 0 8px 0; }
.nm-content strong { color: #ffffff; font-weight: 700; }
.nm-content em { font-style: italic; color: rgba(255,255,255,0.6); }
.nm-content h1,.nm-content h2,.nm-content h3 { color: #ffffff; font-weight: 900; margin: 14px 0 6px 0; line-height: 1.3; letter-spacing: -0.02em; }
.nm-content h1 { font-size: 1.25rem; }
.nm-content h2 { font-size: 1.1rem; }
.nm-content h3 { font-size: 0.95rem; }
.nm-content ul, .nm-content ol { padding-left: 1.2rem; margin: 6px 0; }
.nm-content li { color: rgba(255,255,255,0.8); font-size: 0.875rem; font-weight: 300; line-height: 1.7; margin: 2px 0; }
.nm-content blockquote { border-left: 2px solid rgba(251,146,60,0.5); padding-left: 12px; margin: 8px 0; color: rgba(255,255,255,0.5); font-style: italic; font-size: 0.8rem; }
.nm-content hr { border: none; border-top: 1px solid rgba(255,255,255,0.08); margin: 12px 0; }
.nm-content code:not(pre code) { background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 1px 5px; font-family: 'Courier New', monospace; font-size: 0.75rem; color: rgba(251,146,60,0.9); }
.nm-content a { color: #fb923c; text-decoration: underline; text-underline-offset: 2px; }
.nm-content table { width: 100%; border-collapse: collapse; font-size: 0.78rem; margin: 10px 0; border-radius: 8px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); }
.nm-content th { background: rgba(251,146,60,0.08); color: rgba(255,255,255,0.9); font-weight: 700; padding: 8px 12px; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.1); }
.nm-content td { color: rgba(255,255,255,0.7); padding: 7px 12px; border-bottom: 1px solid rgba(255,255,255,0.05); font-weight: 300; }
.nm-content tr:last-child td { border-bottom: none; }
.nm-content pre { margin: 10px 0; border-radius: 8px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.04); }
.nm-content pre code { display: block; padding: 12px 14px; font-family: 'Courier New', monospace; font-size: 0.75rem; color: rgba(255,255,255,0.85); line-height: 1.7; white-space: pre; overflow-x: auto; background: none; border: none; }
.nm-big { display: block; font-size: 1.25rem; font-weight: 900; color: white; margin-bottom: 10px; line-height: 1.3; letter-spacing: -0.02em; }
.nm-key { color: #fb923c; font-weight: 500; }
.nm-soft { display: block; font-size: 0.75rem; font-style: italic; color: rgba(255,255,255,0.4); margin-top: 10px; line-height: 1.6; }
`

function VoiceStatusCard({ status }) {
    return (
        <div
            className="relative flex items-center gap-4 px-4 py-3 rounded-2xl overflow-hidden"
            style={{
                background: 'rgba(251,146,60,0.04)',
                border: '1px solid rgba(251,146,60,0.12)',
            }}
        >
            {/* Lueur de fond */}
            <div style={{
                position: 'absolute', inset: 0,
                background: 'radial-gradient(ellipse at 0% 50%, rgba(251,146,60,0.08) 0%, transparent 70%)',
                pointerEvents: 'none'
            }} />

            {status === 'thinking' && (
                <>
                    {/* Points pulsants stylisés */}
                    <div className="relative flex items-center gap-1.5 flex-shrink-0">
                        {[0, 160, 320].map((delay, i) => (
                            <span key={i}
                                  className="rounded-full bg-[#fb923c]"
                                  style={{
                                      width: i === 1 ? '7px' : '5px',
                                      height: i === 1 ? '7px' : '5px',
                                      opacity: 0.9,
                                      animation: `bounce 1.2s ease-in-out ${delay}ms infinite`,
                                  }}
                            />
                        ))}
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <p className="text-white/70 text-xs font-medium">NeuralMind réfléchit</p>
                        <p className="text-white/25 text-xs">Génération de la réponse...</p>
                    </div>
                </>
            )}

            {status === 'speaking' && (
                <>
                    {/* Barres audio animées */}
                    <div className="relative flex items-end gap-0.5 flex-shrink-0" style={{ height: '20px', width: '28px' }}>
                        {[6,12,18,14,10,16,8].map((h, i) => (
                            <span key={i}
                                  className="flex-1 rounded-full bg-[#fb923c]"
                                  style={{
                                      height: `${h}px`,
                                      opacity: 0.85,
                                      animation: `pulse 0.6s ease-in-out ${i * 70}ms infinite alternate`,
                                      transformOrigin: 'bottom',
                                  }}
                            />
                        ))}
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <p className="text-[#fb923c] text-xs font-medium">En train de parler</p>
                        <p className="text-white/25 text-xs">Écoute NeuralMind...</p>
                    </div>

                </>
            )}
        </div>
    )
}

function MessageContent({ content, isStreaming }) {
    const containerRef = useRef(null)

    const cleaned = content
        .replace(/\[BIG\]([\s\S]*?)\[\/BIG\]/g, '<span class="nm-big">$1</span>')
        .replace(/\[KEY\]([\s\S]*?)\[\/KEY\]/g, '<span class="nm-key">$1</span>')
        .replace(/\[SOFT\]([\s\S]*?)\[\/SOFT\]/g, '<span class="nm-soft">$1</span>')

    const html = marked.parse(cleaned)

    useEffect(() => {
        if (!containerRef.current) return
        containerRef.current.querySelectorAll('pre:not([data-copy-init])').forEach(pre => {
            pre.setAttribute('data-copy-init', 'true')
            pre.style.cssText = 'position:relative;margin:10px 0;border-radius:8px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.04);'
            const lang = pre.querySelector('code')?.className?.replace('language-','') || ''
            const header = document.createElement('div')
            header.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:6px 12px;border-bottom:1px solid rgba(255,255,255,0.06);'
            header.innerHTML = `
                <span style="font-family:monospace;font-size:0.65rem;color:rgba(251,146,60,0.6);text-transform:uppercase;letter-spacing:0.1em">${lang}</span>
                <button data-copy style="background:none;border:none;cursor:pointer;display:inline-flex;align-items:center;gap:0;column-gap:3px;color:rgba(255,255,255,0.3);font-size:0.65rem;font-family:monospace;line-height:1;padding:0;white-space:nowrap">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;margin-right:3px"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>copier
                </button>`
            const btn = header.querySelector('[data-copy]')
            btn.addEventListener('click', () => {
                const text = pre.querySelector('code')?.innerText || ''
                navigator.clipboard.writeText(text).then(() => {
                    btn.style.color = 'rgba(74,222,128,0.8)'
                    btn.innerHTML = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="flex-shrink:0;margin-right:3px"><polyline points="20 6 9 17 4 12"/></svg>copié`
                    setTimeout(() => {
                        btn.style.color = 'rgba(255,255,255,0.3)'
                        btn.innerHTML = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;margin-right:3px"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>copier`
                    }, 2000)
                })
            })
            pre.insertBefore(header, pre.firstChild)
        })
    })

    return (
        <div className="nm-content" ref={containerRef}>
            <div dangerouslySetInnerHTML={{ __html: html }} />
            {isStreaming && (
                <span className="inline-block w-0.5 h-3.5 bg-[#fb923c] ml-0.5 align-middle animate-pulse" />
            )}
        </div>
    )
}

export default function ChatWindow({ messages, isStreaming, suggestions, onSuggestion }) {
    const bottomRef = useRef(null)
    const containerRef = useRef(null)
    const [userScrolledUp, setUserScrolledUp] = useState(false)
    const prevMessageCount = useRef(messages.length)

    function handleScroll() {
        const el = containerRef.current
        if (!el) return
        const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
        if (distanceFromBottom > 30) setUserScrolledUp(true)
    }

    useEffect(() => {
        if (messages.length > prevMessageCount.current) setUserScrolledUp(false)
        prevMessageCount.current = messages.length
    }, [messages.length])

    useEffect(() => {
        if (!userScrolledUp) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, userScrolledUp])

    if (messages.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-start justify-center gap-4">
                <style>{NM_STYLES}</style>
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
            <style>{NM_STYLES}</style>
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
                        ) : msg.voiceStatus ? (
                            // Card thinking / speaking
                            <VoiceStatusCard status={msg.voiceStatus} />
                        ) : (
                            <MessageContent content={msg.content} isStreaming={isStreamed} />
                        )}

                        {msg.role === 'assistant' && !msg.voiceStatus && msg.emotion && (
                            <p className={`text-xs mt-2 font-medium ${EMOTION_COLORS[msg.emotion] || 'text-white/50'}`}>
                                ◆ {msg.emotion}
                            </p>
                        )}
                        {msg.ttsRateLimit && (
                            <div className="mt-3 flex items-center gap-3 px-4 py-3 rounded-xl"
                                 style={{ background: 'rgba(251,146,60,0.06)', border: '1px solid rgba(251,146,60,0.15)' }}>
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(251,146,60,0.7)" strokeWidth="2" style={{ flexShrink: 0 }}>
                                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                                    <line x1="23" y1="9" x2="17" y2="15"/>
                                    <line x1="17" y1="9" x2="23" y2="15"/>
                                </svg>
                                <div>
                                    <p style={{ color: 'rgba(251,146,60,0.85)', fontSize: '0.75rem', fontWeight: 600 }}>
                                        Mode vocal indisponible aujourd'hui
                                    </p>
                                    <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem', marginTop: '2px' }}>
                                        Vous êtes basculé en mode texte
                                    </p>
                                </div>
                            </div>
                        )}

                    </div>
                )
            })}

            {!isStreaming && suggestions.length > 0 && (
                <div className="flex flex-col gap-2">
                    <p className="text-white/40 text-xs tracking-widest uppercase">Continuer</p>
                    <div className="flex flex-col gap-2">
                        {suggestions.map((s, i) => (
                            <button key={i} onClick={() => onSuggestion(s)}
                                    className="text-left text-white/60 text-xs border border-white/20 rounded-xl px-4 py-2.5 hover:text-white/90 hover:border-white/40 transition-all duration-200 cursor-pointer bg-transparent">
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