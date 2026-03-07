import { useState, useCallback } from 'react'
import Brain from './components/Brain.jsx'
import ChatInput from './components/ChatInput.jsx'
import ChatWindow from './components/ChatWindow.jsx'
import InfoOverlay from './components/InfoOverlay.jsx'
import { useGroq } from './hooks/useGroq.js'

function App() {
    const [messages, setMessages] = useState([])
    const [isThinking, setIsThinking] = useState(false)
    const [emotion, setEmotion] = useState('calm')
    const [suggestions, setSuggestions] = useState([])
    const { sendMessage, isStreaming } = useGroq()

    const handleSend = useCallback(async (userText) => {
        if (isStreaming) return

        // Ajouter message user
        setMessages(prev => [...prev, { role: 'user', content: userText }])
        setSuggestions([])
        setIsThinking(true)

        // Préparer le message assistant vide
        setMessages(prev => [...prev, { role: 'assistant', content: '', emotion: null }])

        await sendMessage(
            userText,

            // onChunk — streaming mot par mot
            (visibleText) => {
                setMessages(prev => {
                    const updated = [...prev]
                    updated[updated.length - 1] = {
                        ...updated[updated.length - 1],
                        content: visibleText,
                    }
                    return updated
                })
            },

            // onEmotion
            (detectedEmotion) => {
                setEmotion(detectedEmotion)
                setMessages(prev => {
                    const updated = [...prev]
                    updated[updated.length - 1] = {
                        ...updated[updated.length - 1],
                        emotion: detectedEmotion,
                    }
                    return updated
                })
            },

            // onSuggestions
            (detectedSuggestions) => {
                setSuggestions(detectedSuggestions)
            },

            // onDone
            () => {
                setIsThinking(false)
            }
        )
    }, [isStreaming, sendMessage])

    function handleSuggestion(suggestion) {
        handleSend(suggestion)
    }

    return (
        <div className="w-screen h-screen flex bg-[#050508] overflow-hidden">

            <InfoOverlay />

            {/* LEFT — Chat */}
            <div className="w-[45%] flex flex-col px-12 py-10 z-10 overflow-hidden">

                {/* Header */}
                <div className="mb-8 flex-shrink-0">
                    <h1 className="text-white text-2xl font-black tracking-tight mb-1">NeuralMind</h1>
                    <p className="text-white/30 text-xs tracking-widest uppercase">Cerveau numérique de Tonny Anderson</p>
                </div>

                {/* Messages */}
                <ChatWindow
                    messages={messages}
                    isStreaming={isStreaming}
                    suggestions={suggestions}
                    onSuggestion={handleSuggestion}
                />

                {/* Input */}
                <div className="flex-shrink-0 mt-6">
                    <ChatInput
                        onSend={handleSend}
                        disabled={isStreaming}
                        showExamples={messages.length === 0}
                    />
                </div>

            </div>

            {/* DIVIDER */}
            <div className="w-px bg-white/5 self-stretch flex-shrink-0" />

            {/* RIGHT — Cerveau */}
            <div className="flex-1 relative">
                <Brain isThinking={isThinking} emotion={emotion} />
            </div>

        </div>
    )
}

export default App