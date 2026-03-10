import { useState, useCallback, useRef } from 'react'
import Brain from './components/Brain.jsx'
import ChatInput from './components/ChatInput.jsx'
import ChatWindow from './components/ChatWindow.jsx'
import InfoOverlay from './components/InfoOverlay.jsx'
import { useGroq } from './hooks/useGroq.js'

const MESSAGES_KEY = 'neuralmind_messages'

function loadMessages() {
    try { return JSON.parse(localStorage.getItem(MESSAGES_KEY)) || [] }
    catch { return [] }
}

async function fetchTTS(text, apiKey) {
    const response = await fetch('https://api.groq.com/openai/v1/audio/speech', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'canopylabs/orpheus-v1-english',
            input: text,
            voice: 'diana',
            response_format: 'wav',
        }),
    })
    if (!response.ok) throw new Error(await response.text())
    return await response.blob()
}

function App() {
    const [messages, setMessages] = useState(() => loadMessages())
    const [isThinking, setIsThinking] = useState(false)
    const [emotion, setEmotion] = useState('calm')
    const [suggestions, setSuggestions] = useState([])
    const [voiceMode, setVoiceMode] = useState(false)
    const audioRef = useRef(null)
    const { sendMessage, sendMessageVoice, isStreaming, resetHistory } = useGroq()

    // — Mode texte —
    const handleSendText = useCallback(async (userText) => {
        if (isStreaming) return
        setMessages(prev => [...prev, { role: 'user', content: userText }])
        setSuggestions([])
        setIsThinking(true)
        setMessages(prev => [...prev, { role: 'assistant', content: '', emotion: null }])

        await sendMessage(
            userText,
            (visibleText) => {
                setMessages(prev => {
                    const updated = [...prev]
                    updated[updated.length - 1] = { ...updated[updated.length - 1], content: visibleText }
                    return updated
                })
            },
            (detectedEmotion) => {
                setEmotion(detectedEmotion)
                setMessages(prev => {
                    const updated = [...prev]
                    updated[updated.length - 1] = { ...updated[updated.length - 1], emotion: detectedEmotion }
                    return updated
                })
            },
            (detectedSuggestions) => { setSuggestions(detectedSuggestions) },
            () => {
                setIsThinking(false)
                setMessages(prev => {
                    try { localStorage.setItem(MESSAGES_KEY, JSON.stringify(prev)) } catch {}
                    return prev
                })
            }
        )
    }, [isStreaming, sendMessage])

    // — Mode vocal —
    const handleSendVoice = useCallback(async (userText) => {
        if (isStreaming) return

        // 1. Message user + card thinking dans le chat
        setMessages(prev => [
            ...prev,
            { role: 'user', content: userText },
            { role: 'assistant', content: '', voiceStatus: 'thinking' }
        ])

        // 2. Groq génère la réponse (pas de streaming, rapide)
        const responseText = await sendMessageVoice(userText)

        // 3. Fetch TTS — toujours thinking (l'audio n'est pas encore là)
        try {
            const blob = await fetchTTS(responseText, import.meta.env.VITE_GROQ_API_KEY)
            const url = URL.createObjectURL(blob)
            const audio = new Audio(url)
            audioRef.current = audio

            const finalize = () => {
                URL.revokeObjectURL(url)
                setMessages(prev => {
                    const updated = [...prev]
                    updated[updated.length - 1] = {
                        role: 'assistant',
                        content: responseText,
                        emotion: null,
                        voiceStatus: null,
                    }
                    try { localStorage.setItem(MESSAGES_KEY, JSON.stringify(updated)) } catch {}
                    return updated
                })
            }

            // 4. Audio prêt → passe en speaking
            setMessages(prev => {
                const updated = [...prev]
                updated[updated.length - 1] = {
                    ...updated[updated.length - 1],
                    voiceStatus: 'speaking',
                }
                return updated
            })

            audio.onended = finalize
            audio.onerror = finalize
            await audio.play()

        } catch (err) {
            console.error('TTS error:', err)
            // TTS bloqué (Brave/localhost) — afficher le texte avec badge
            setMessages(prev => {
                const updated = [...prev]
                updated[updated.length - 1] = {
                    role: 'assistant',
                    content: responseText,
                    emotion: null,
                    voiceStatus: null,
                    ttsError: true,
                }
                try { localStorage.setItem(MESSAGES_KEY, JSON.stringify(updated)) } catch {}
                return updated
            })
        }
    }, [isStreaming, sendMessageVoice])

    const handleSend = useCallback((userText) => {
        if (voiceMode) return handleSendVoice(userText)
        return handleSendText(userText)
    }, [voiceMode, handleSendVoice, handleSendText])

    function handleSuggestion(suggestion) { handleSend(suggestion) }

    function handleReset() {
        audioRef.current?.pause()
        setMessages([])
        setSuggestions([])
        resetHistory()
        try { localStorage.removeItem(MESSAGES_KEY) } catch {}
    }

    function handleToggleVoice() {
        audioRef.current?.pause()
        setVoiceMode(v => !v)
    }

    const isDisabled = isStreaming

    return (
        <div className="w-screen h-screen flex bg-[#050508] overflow-hidden">
            <InfoOverlay />

            {/* LEFT — Chat */}
            <div className="w-full md:w-[45%] flex flex-col px-6 md:px-12 py-8 md:py-10 z-10 overflow-hidden flex-shrink-0">

                {/* Header */}
                <div className="mb-4 flex-shrink-0 flex items-center justify-between">
                    <div>
                        <h1 className="text-white text-2xl font-black tracking-tight mb-1">
                            Neural<span className="text-[#fb923c]">Mind</span>
                        </h1>
                        <p className="text-white/30 text-xs tracking-widest uppercase">
                            Cerveau numérique de Tonny Anderson
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <InfoOverlay inline />

                        {/* Toggle mode vocal */}
                        <button
                            onClick={handleToggleVoice}
                            title={voiceMode ? "Désactiver la voix" : "Activer la voix"}
                            className="flex items-center gap-1.5 text-xs transition-all duration-200 bg-transparent border-none cursor-pointer"
                            style={{ color: voiceMode ? '#fb923c' : 'rgba(255,255,255,0.25)' }}
                        >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                                {voiceMode
                                    ? <><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></>
                                    : <><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></>
                                }
                            </svg>
                            voix
                        </button>

                        {messages.length > 0 && (
                            <button
                                onClick={handleReset}
                                title="Nouvelle conversation"
                                className="flex items-center gap-1.5 text-white/25 hover:text-white/60 text-xs transition-colors duration-200 bg-transparent border-none cursor-pointer"
                            >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                                    <path d="M3 3v5h5"/>
                                </svg>
                                reset
                            </button>
                        )}
                    </div>
                </div>

                {/* Badge IA Vocal activé */}
                {voiceMode && (
                    <div className="flex-shrink-0 mb-4 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#fb923c] animate-pulse" />
                        <p className="text-[#fb923c]/70 text-xs tracking-widest uppercase">IA Vocal activé</p>
                    </div>
                )}

                {/* Chat — même window pour texte et vocal */}
                <ChatWindow
                    messages={messages}
                    isStreaming={isStreaming}
                    suggestions={voiceMode ? [] : suggestions}
                    onSuggestion={handleSuggestion}
                />

                {/* Input */}
                <div className="flex-shrink-0 mt-4 md:mt-6">
                    <ChatInput
                        onSend={handleSend}
                        disabled={isDisabled}
                        showExamples={messages.length === 0}
                        voiceMode={voiceMode}
                        onToggleVoice={handleToggleVoice}
                    />
                </div>
            </div>

            {/* DIVIDER + CERVEAU */}
            <div className="hidden md:block w-px bg-white/5 self-stretch flex-shrink-0" />
            <div className="hidden md:block flex-1 relative">
                <Brain isThinking={isThinking} emotion={emotion} />
            </div>
        </div>
    )
}

export default App