import { useState } from 'react'
import Box from '@mui/joy/Box'
import Typography from '@mui/joy/Typography'
import Sheet from '@mui/joy/Sheet'
import Table from '@mui/joy/Table'
import Button from '@mui/joy/Button'
import Tooltip from '@mui/joy/Tooltip'

import InlineText from './InlineText'
import slugify from './slugify'

function Heading({ level, content }) {
    const id = slugify(content)
    const [copied, setCopied] = useState(false)

    // Клик по якорю: переходим к разделу и кладём ссылку в буфер обмена.
    const onAnchorClick = (event) => {
        event.preventDefault()
        const { origin, pathname, search } = window.location
        const url = `${origin}${pathname}${search}#${id}`

        window.history.replaceState(null, '', `#${id}`)
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

        navigator.clipboard
            ?.writeText(url)
            .then(() => {
                setCopied(true)
                setTimeout(() => setCopied(false), 1600)
            })
            .catch(() => {})
    }

    return (
        <Typography
            id={id}
            component={level === 2 ? 'h2' : 'h3'}
            level={level === 2 ? 'h3' : 'h4'}
            sx={{
                mt: level === 2 ? 5 : 4,
                mb: 1.5,
                fontWeight: 700,
                scrollMarginTop: '80px',
                '&:hover .anchor': { opacity: 1 },
            }}
        >
            <InlineText text={content} />
            <Tooltip
                title={copied ? 'Ссылка скопирована' : 'Скопировать ссылку на раздел'}
                variant="soft"
                size="sm"
                placement="top"
            >
                <Box
                    component="a"
                    href={`#${id}`}
                    onClick={onAnchorClick}
                    className="anchor"
                    aria-label="Ссылка на раздел"
                    sx={{
                        ml: 1,
                        display: 'inline-flex',
                        alignItems: 'center',
                        verticalAlign: 'middle',
                        fontSize: '0.68em',
                        fontWeight: 400,
                        textDecoration: 'none',
                        color: copied ? 'success.plainColor' : 'text.tertiary',
                        opacity: { xs: 1, md: copied ? 1 : 0 },
                        transition: 'opacity 0.18s ease, color 0.18s ease',
                        '&:hover': { color: 'primary.plainColor' },
                        '&:focus-visible': { opacity: 1 },
                    }}
                >
                    {copied ? '✓' : '#'}
                </Box>
            </Tooltip>
        </Typography>
    )
}

function Paragraph({ content }) {
    return (
        <Typography sx={{ my: 2, lineHeight: 1.75, color: 'text.secondary', fontSize: 'lg' }}>
            <InlineText text={content} />
        </Typography>
    )
}

function Quote({ content }) {
    return (
        <Sheet
            variant="soft"
            sx={{
                my: 3,
                p: 2.25,
                borderRadius: 'lg',
                bgcolor: 'primary.softBg',
                display: 'flex',
                gap: 2,
                alignItems: 'stretch',
            }}
        >
            <Box
                aria-hidden
                sx={{ flexShrink: 0, width: '4px', borderRadius: '999px', bgcolor: 'primary.400' }}
            />
            <Typography sx={{ fontSize: 'lg', lineHeight: 1.7, color: 'text.primary' }}>
                <InlineText text={content} />
            </Typography>
        </Sheet>
    )
}

function Note({ content }) {
    return (
        <Sheet
            variant="soft"
            sx={{
                my: 3,
                p: 2.5,
                borderRadius: 'lg',
                display: 'flex',
                gap: 2,
                alignItems: 'flex-start',
                bgcolor: 'page.noteBg',
            }}
        >
            <Box aria-hidden sx={{ fontSize: '22px', lineHeight: 1.4 }}>
                💡
            </Box>
            <Typography sx={{ lineHeight: 1.7, color: 'text.primary' }}>
                <InlineText text={content} />
            </Typography>
        </Sheet>
    )
}

function Picture({ src, alt }) {
    return (
        <Box
            component="figure"
            sx={{
                my: 4,
                mx: 0,
                borderRadius: 'lg',
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'page.border',
                boxShadow: (theme) => theme.vars.palette.page.cardShadow,
                bgcolor: 'background.level1',
            }}
        >
            <Box
                component="img"
                src={src}
                alt={alt || ''}
                loading="lazy"
                sx={{ display: 'block', width: '100%', height: 'auto' }}
            />
        </Box>
    )
}

function CodeBlock({ content, language }) {
    const [copied, setCopied] = useState(false)

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(content)
            setCopied(true)
            setTimeout(() => setCopied(false), 1600)
        } catch {
            setCopied(false)
        }
    }

    return (
        <Sheet
            variant="outlined"
            sx={{
                my: 3,
                borderRadius: 'lg',
                overflow: 'hidden',
                borderColor: 'page.border',
                bgcolor: 'background.level1',
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 2,
                    py: 1,
                    borderBottom: '1px solid',
                    borderColor: 'page.border',
                }}
            >
                <Typography level="body-xs" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {language || 'code'}
                </Typography>
                <Button size="sm" variant="plain" color="neutral" onClick={copy} sx={{ fontSize: 'xs' }}>
                    {copied ? 'Скопировано' : 'Копировать'}
                </Button>
            </Box>
            <Box
                component="pre"
                sx={{
                    m: 0,
                    p: 2.5,
                    overflowX: 'auto',
                    fontFamily: 'code',
                    fontSize: '14px',
                    lineHeight: 1.65,
                    color: 'text.primary',
                }}
            >
                <code>{content}</code>
            </Box>
        </Sheet>
    )
}

function ListItems({ items }) {
    return items.map((item, index) => {
        if (typeof item === 'string') {
            return (
                <Box component="li" key={index} sx={{ mb: 1 }}>
                    <InlineText text={item} />
                </Box>
            )
        }
        return (
            <Box component="li" key={index} sx={{ mb: 1 }}>
                <InlineText text={item.text} />
                <Box component="ul" sx={{ mt: 1, pl: 3 }}>
                    <ListItems items={item.items || []} />
                </Box>
            </Box>
        )
    })
}

function List({ ordered, items }) {
    return (
        <Box
            component={ordered ? 'ol' : 'ul'}
            sx={{
                my: 2,
                pl: 3,
                color: 'text.secondary',
                fontSize: 'lg',
                lineHeight: 1.7,
                '& ::marker': { color: 'primary.400' },
            }}
        >
            <ListItems items={items} />
        </Box>
    )
}

function DataTable({ head, rows }) {
    return (
        <Sheet
            variant="outlined"
            sx={{
                my: 3,
                borderRadius: 'lg',
                overflow: 'auto',
                borderColor: 'page.border',
            }}
        >
            <Table
                sx={{
                    '--TableCell-headBackground': 'var(--dd-palette-background-level1)',
                    '--TableCell-paddingY': '12px',
                    '--TableCell-paddingX': '16px',
                    minWidth: '520px',
                }}
            >
                <thead>
                    <tr>
                        {head.map((cell, index) => (
                            <th key={index} style={{ fontWeight: 700 }}>
                                <InlineText text={cell} />
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {row.map((cell, cellIndex) => (
                                <td key={cellIndex}>
                                    <InlineText text={cell} />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Sheet>
    )
}

const renderers = {
    p: (block) => <Paragraph content={block.content} />,
    h2: (block) => <Heading level={2} content={block.content} />,
    h3: (block) => <Heading level={3} content={block.content} />,
    quote: (block) => <Quote content={block.content} />,
    note: (block) => <Note content={block.content} />,
    img: (block) => <Picture src={block.src} alt={block.alt} />,
    code: (block) => <CodeBlock content={block.content} language={block.language} />,
    ul: (block) => <List items={block.items || []} />,
    ol: (block) => <List ordered items={block.items || []} />,
    table: (block) => <DataTable head={block.head || []} rows={block.rows || []} />,
}

export default function ContentBlocks({ blocks = [] }) {
    return (
        <Box sx={{ '& > *:first-of-type': { mt: 0 } }}>
            {blocks.map((block, index) => {
                const render = renderers[block.block]
                if (!render) return null
                return <Box key={index}>{render(block)}</Box>
            })}
        </Box>
    )
}
