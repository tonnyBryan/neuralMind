// Parse les balises custom et retourne un tableau de segments
export function parseMessage(text) {
    const segments = []
    const regex = /\[BIG\]([\s\S]*?)\[\/BIG\]|\[KEY\]([\s\S]*?)\[\/KEY\]|\[SOFT\]([\s\S]*?)\[\/SOFT\]/g

    let lastIndex = 0
    let match

    while ((match = regex.exec(text)) !== null) {
        // Texte normal avant la balise
        if (match.index > lastIndex) {
            segments.push({ type: 'text', content: text.slice(lastIndex, match.index) })
        }

        if (match[1] !== undefined) segments.push({ type: 'big', content: match[1] })
        if (match[2] !== undefined) segments.push({ type: 'key', content: match[2] })
        if (match[3] !== undefined) segments.push({ type: 'soft', content: match[3] })

        lastIndex = regex.lastIndex
    }

    // Texte restant après la dernière balise
    if (lastIndex < text.length) {
        segments.push({ type: 'text', content: text.slice(lastIndex) })
    }

    return segments
}