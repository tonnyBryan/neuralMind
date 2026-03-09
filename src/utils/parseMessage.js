export function parseMessage(text) {
    const segments = []

    const combinedRegex = /```(\w*)\n?([\s\S]*?)```|\[BIG\]([\s\S]*?)\[\/BIG\]|\[KEY\]([\s\S]*?)\[\/KEY\]|\[SOFT\]([\s\S]*?)\[\/SOFT\]/g

    let lastIndex = 0
    let match

    while ((match = combinedRegex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            segments.push({ type: 'text', content: text.slice(lastIndex, match.index) })
        }

        if (match[1] !== undefined || match[2] !== undefined) {
            segments.push({ type: 'code', lang: match[1] || '', content: match[2] || '' })
        } else if (match[3] !== undefined) {
            segments.push({ type: 'big', content: match[3] })
        } else if (match[4] !== undefined) {
            segments.push({ type: 'key', content: match[4] })
        } else if (match[5] !== undefined) {
            segments.push({ type: 'soft', content: match[5] })
        }

        lastIndex = combinedRegex.lastIndex
    }

    if (lastIndex < text.length) {
        segments.push({ type: 'text', content: text.slice(lastIndex) })
    }

    return segments
}