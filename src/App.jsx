import { useState, useCallback } from 'react'
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

function App() {
    const [messages, setMessages] = useState(() => loadMessages())
    const [isThinking, setIsThinking] = useState(false)
    const [emotion, setEmotion] = useState('calm')
    const [suggestions, setSuggestions] = useState([])
    const { sendMessage, isStreaming, resetHistory } = useGroq()

    const handleSend = useCallback(async (userText) => {
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

    function handleSuggestion(suggestion) { handleSend(suggestion) }

    function handleReset() {
        setMessages([])
        setSuggestions([])
        resetHistory()
        try { localStorage.removeItem(MESSAGES_KEY) } catch {}
    }

    return (
        <div className="w-screen h-screen flex bg-[#050508] overflow-hidden">

            <InfoOverlay />

            {/* LEFT — Chat — plein écran mobile, 45% desktop */}
            <div className="w-full md:w-[45%] flex flex-col px-6 md:px-12 py-8 md:py-10 z-10 overflow-hidden flex-shrink-0">

                {/* Header */}
                <div className="mb-6 md:mb-8 flex-shrink-0 flex items-start justify-between">
                    <div>
                        <h1 className="text-white text-2xl font-black tracking-tight mb-1">
                            Neural<span className="text-[#fb923c]">Mind</span>
                        </h1>
                        <p className="text-white/30 text-xs tracking-widest uppercase">Cerveau numérique de Tonny Anderson</p>
                    </div>
                    {messages.length > 0 && (
                        <button
                            onClick={handleReset}
                            className="text-white/20 hover:text-white/50 text-xs transition-colors duration-200 mt-1"
                            title="Nouvelle conversation"
                        >
                            ↺ reset
                        </button>
                    )}
                </div>

                {/* Messages */}
                <ChatWindow
                    messages={messages}
                    isStreaming={isStreaming}
                    suggestions={suggestions}
                    onSuggestion={handleSuggestion}
                />

                {/* Input */}
                <div className="flex-shrink-0 mt-4 md:mt-6">
                    <ChatInput
                        onSend={handleSend}
                        disabled={isStreaming}
                        showExamples={messages.length === 0}
                    />
                </div>
            </div>

            {/* DIVIDER + CERVEAU — caché sur mobile */}
            <div className="hidden md:block w-px bg-white/5 self-stretch flex-shrink-0" />
            <div className="hidden md:block flex-1 relative">
                <Brain isThinking={isThinking} emotion={emotion} />
            </div>

        </div>
    )
}

export default App