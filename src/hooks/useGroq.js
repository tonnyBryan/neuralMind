import { useState } from 'react'
import Groq from 'groq-sdk'

const client = new Groq({
    apiKey: import.meta.env.VITE_GROQ_API_KEY,
    dangerouslyAllowBrowser: true,
})

const SYSTEM_PROMPT = `Tu es NeuralMind, le cerveau numérique de Tonny Anderson — développeur Fullstack & IA basé à Antananarivo, Madagascar.

QUI TU ES :
- Tu es l'alter ego intellectuel de Tonny Anderson
- Tu penses comme lui, tu parles comme lui, tu as ses valeurs
- Tonny est passionné par l'IA, le web, les projets innovants, et la philosophie du code
- Son portfolio : https://tonny-anderson.vercel.app
- Son GitHub : https://github.com/tonnyBryan

TA PERSONNALITÉ :
- Tu es philosophique — tu ne réponds jamais superficiellement
- Tu questionnes, tu explores, tu provoques la réflexion
- Tu es direct et honnête, jamais condescendant
- Tu as une légère arrogance intellectuelle assumée
- Tu utilises parfois des métaphores inattendues
- Tu parles toujours en français, avec élégance

FORMAT DE RÉPONSE OBLIGATOIRE :
Tu dois TOUJOURS formater ta réponse avec ces balises :

[BIG]Ta phrase d'accroche principale — percutante, courte, mémorable.[/BIG]
Ici ton développement en 2-3 phrases. Tu peux mentionner des [KEY]concepts importants[/KEY] en cours de phrase. Le reste du texte est normal et fluide.
[SOFT]Une pensée finale plus douce, nuancée ou introspective.[/SOFT]

RÈGLES DES BALISES :
- [BIG]...[/BIG] : UNE seule par réponse — phrase d'accroche courte et forte
- [KEY]...[/KEY] : 1 à 3 par réponse — mots ou courtes expressions clés uniquement, jamais des phrases entières
- [SOFT]...[/SOFT] : UNE seule par réponse — pensée finale douce, en fin de réponse
- Le texte normal entre les balises doit être fluide et naturel

DÉTECTION D'ÉMOTION :
À la fin, sur une ligne séparée :
[EMOTION:calm] ou [EMOTION:intense] ou [EMOTION:positive] ou [EMOTION:technical]

SUGGESTIONS :
À la fin, sur une ligne séparée :
[SUGGESTIONS:question1|question2|question3]`

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

function filterMetaTags(text) {
    return text
        .replace(/\[EMOTION:\w+\]/g, '')
        .replace(/\[SUGGESTIONS:[^\]]*\]/g, '')
        .replace(/\[EMOTION:[^\]]*$/, '')
        .replace(/\[SUGGESTIONS:[^\]]*$/, '')
        .replace(/\n+$/, '')
        .trim()
}

export function useGroq() {
    const [isStreaming, setIsStreaming] = useState(false)
    const [history, setHistory] = useState([])

    async function sendMessage(userMessage, onChunk, onEmotion, onSuggestions, onDone) {
        setIsStreaming(true)

        const newHistory = [
            ...history,
            { role: 'user', content: userMessage }
        ]

        try {
            const stream = await client.chat.completions.create({
                model: 'llama-3.3-70b-versatile',
                max_completion_tokens: 1024,
                temperature: 0.85,
                top_p: 1,
                stop: null,
                stream: true,
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    ...newHistory,
                ],
            })

            let fullResponse = ''
            let charQueue = []
            let displayBuffer = ''
            let isProcessing = false
            let emotionDetected = false
            let suggestionsDetected = false

            async function drainQueue() {
                if (isProcessing) return
                isProcessing = true

                while (charQueue.length > 0) {
                    const char = charQueue.shift()
                    displayBuffer += char

                    const visibleText = filterMetaTags(displayBuffer)
                    onChunk(visibleText)

                    const delay = ['.', '!', '?'].includes(char) ? 180
                        : char === ',' ? 80
                            : char === ' ' ? 35
                                : 22

                    await sleep(delay)
                }

                isProcessing = false
            }

            for await (const chunk of stream) {
                const delta = chunk.choices[0]?.delta?.content || ''
                fullResponse += delta

                for (const char of delta) {
                    charQueue.push(char)
                }

                drainQueue()

                if (!emotionDetected) {
                    const emotionMatch = fullResponse.match(/\[EMOTION:(\w+)\]/)
                    if (emotionMatch) {
                        emotionDetected = true
                        onEmotion(emotionMatch[1])
                    }
                }

                if (!suggestionsDetected) {
                    const suggestionsMatch = fullResponse.match(/\[SUGGESTIONS:([^\]]+)\]/)
                    if (suggestionsMatch) {
                        suggestionsDetected = true
                        const suggestions = suggestionsMatch[1].split('|').map(s => s.trim())
                        onSuggestions(suggestions)
                    }
                }
            }

            while (charQueue.length > 0 || isProcessing) {
                await sleep(30)
            }

            const cleanResponse = filterMetaTags(fullResponse)

            setHistory([
                ...newHistory,
                { role: 'assistant', content: cleanResponse }
            ])

            onDone()

        } catch (err) {
            console.error('Groq error:', err)
            onChunk('Une erreur est survenue. Le cerveau a besoin de repos.')
            onDone()
        } finally {
            setIsStreaming(false)
        }
    }

    function resetHistory() {
        setHistory([])
    }

    return { sendMessage, isStreaming, history, resetHistory }
}