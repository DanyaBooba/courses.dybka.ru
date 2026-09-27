import { Fragment } from 'react'
import Link from '@mui/joy/Link'
import Box from '@mui/joy/Box'

// Упрощённый inline-markdown: **жирный**, _курсив_, `код`, [ссылка](адрес).
const PATTERN = /(\*\*[^*]+\*\*|_[^_]+_|`[^`]+`|\[[^\]]+\]\([^)]+\))/g

function Code({ children }) {
    return (
        <Box
            component="code"
            sx={{
                fontFamily: 'code',
                fontSize: '0.88em',
                px: '0.4em',
                py: '0.12em',
                borderRadius: 'xs',
                bgcolor: 'primary.softBg',
                color: 'primary.softColor',
                overflowWrap: 'anywhere',
            }}
        >
            {children}
        </Box>
    )
}

export default function InlineText({ text }) {
    if (typeof text !== 'string') return null

    const parts = text.split(PATTERN).filter((part) => part !== '')

    return parts.map((part, index) => {
        const key = `${index}-${part.slice(0, 12)}`

        if (part.startsWith('**') && part.endsWith('**')) {
            return (
                <Box component="strong" key={key} sx={{ fontWeight: 700 }}>
                    {part.slice(2, -2)}
                </Box>
            )
        }

        if (part.startsWith('_') && part.endsWith('_') && part.length > 2) {
            return <em key={key}>{part.slice(1, -1)}</em>
        }

        if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
            return <Code key={key}>{part.slice(1, -1)}</Code>
        }

        const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
        if (link) {
            const href = link[2]
            const external = /^(https?:|mailto:)/.test(href)
            return (
                <Link
                    key={key}
                    href={href}
                    target={external && !href.startsWith('mailto:') ? '_blank' : undefined}
                    rel={external ? 'noreferrer' : undefined}
                    // В тексте курса ссылка всегда подчёркнута, а не только при наведении
                    underline="always"
                    sx={{ fontWeight: 500 }}
                >
                    {link[1]}
                </Link>
            )
        }

        return <Fragment key={key}>{part}</Fragment>
    })
}
