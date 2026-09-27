import { useMemo, useState } from 'react'
import Box from '@mui/joy/Box'
import Typography from '@mui/joy/Typography'
import Sheet from '@mui/joy/Sheet'
import Table from '@mui/joy/Table'
import Button from '@mui/joy/Button'
import Tooltip from '@mui/joy/Tooltip'
import { CheckIcon, HashIcon, LightbulbIcon } from '@phosphor-icons/react'

import InlineText from './InlineText'
import slugify from './slugify'
import Checklist from './Checklist'
import CourseList from './CourseList'
import LessonQuiz from '../Quiz/LessonQuiz'
import { highlight, tokenStyles } from './highlight'

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
            .catch(() => { })
    }

    return (
        <Typography
            id={id}
            component={level === 2 ? 'h2' : 'h3'}
            level={level === 2 ? 'h3' : 'h4'}
            sx={{
                // Раздел открывается тонкой линейкой — как в печатном справочнике
                mt: level === 2 ? 5 : 4,
                pt: level === 2 ? 2 : 0,
                mb: 1.5,
                borderTop: level === 2 ? '1px solid' : 'none',
                borderColor: 'page.border',
                fontWeight: 600,
                letterSpacing: '-0.02em',
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
                    {copied ? <CheckIcon size={20} weight="bold" /> : <HashIcon size={20} weight="bold" />}
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
        <Box
            component="blockquote"
            sx={{
                my: 3.5,
                mx: 0,
                pl: 2.5,
                borderLeft: '2px solid',
                borderColor: 'page.rule',
            }}
        >
            <Typography
                sx={{
                    fontFamily: 'display',
                    fontStyle: 'italic',
                    fontSize: 'lg',
                    lineHeight: 1.6,
                    color: 'text.primary',
                }}
            >
                <InlineText text={content} />
            </Typography>
        </Box>
    )
}

function Note({ content }) {
    return (
        <Sheet
            variant="plain"
            sx={{
                my: 3,
                p: 2.25,
                borderRadius: 'md',
                display: 'flex',
                gap: 1.75,
                alignItems: 'flex-start',
                bgcolor: 'page.noteBg',
                borderLeft: '2px solid',
                borderColor: 'page.noteBar',
            }}
        >
            <Box aria-hidden sx={{ flexShrink: 0, mt: '2px', color: 'page.noteBar' }}>
                <LightbulbIcon size={22} weight="fill" />
            </Box>
            <Typography sx={{ lineHeight: 1.7, color: 'text.primary' }}>
                <InlineText text={content} />
            </Typography>
        </Sheet>
    )
}

/** Подпись под картинкой — только если она задана явно полем `caption`. */
function Caption({ text }) {
    if (!text) return null
    return (
        <Typography
            component="figcaption"
            sx={{
                px: 2,
                py: 1.25,
                borderTop: '1px solid',
                borderColor: 'page.border',
                fontSize: 'sm',
                color: 'text.tertiary',
            }}
        >
            <InlineText text={text} />
        </Typography>
    )
}

/**
 * Картинка урока. Клик открывает её на весь экран через Fancybox — каждая
 * картинка сама по себе, без галереи, счётчика и стрелок. Если файла ещё нет
 * (`src` пустой), на её месте стоит плашка «ФОТО» того же размера.
 */
function Picture({ src, alt, caption, ratio = '16 / 9' }) {
    const frame = {
        my: 4,
        mx: 0,
        borderRadius: 'md',
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'page.border',
        bgcolor: 'background.level1',
    }

    if (!src) {
        return (
            <Box component="figure" sx={frame}>
                <Box
                    aria-hidden
                    sx={{
                        aspectRatio: ratio,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'code',
                        fontSize: '12px',
                        letterSpacing: '0.24em',
                        color: 'text.tertiary',
                    }}
                >
                    ФОТО
                </Box>
                <Caption text={caption} />
            </Box>
        )
    }

    return (
        <Box component="figure" sx={frame}>
            <Box
                component="a"
                href={src}
                data-fancybox={`img-${src}`}
                aria-label="Открыть картинку на весь экран"
                sx={{ display: 'block', cursor: 'zoom-in' }}
            >
                <Box
                    component="img"
                    src={src}
                    alt={alt || ''}
                    loading="lazy"
                    sx={{ display: 'block', width: '100%', height: 'auto' }}
                />
            </Box>
            <Caption text={caption} />
        </Box>
    )
}

function CodeBlock({ content, language }) {
    const [copied, setCopied] = useState(false)

    // Prism отдаёт готовую разметку с токенами; цвета берутся из палитры темы
    const markup = useMemo(() => highlight(content, language), [content, language])

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
                borderRadius: 'md',
                overflow: 'hidden',
                borderColor: 'page.border',
                bgcolor: 'page.codeBg',
                maxWidth: '100%',
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
                <Typography
                    sx={{
                        fontFamily: 'code',
                        fontSize: '11px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.12em',
                        color: 'text.tertiary',
                    }}
                >
                    {language || 'code'}
                </Typography>
                <Button
                    size="sm"
                    variant="plain"
                    color="neutral"
                    onClick={copy}
                    sx={{ fontFamily: 'code', fontSize: '11px', fontWeight: 400 }}
                >
                    {copied ? 'Скопировано' : 'Копировать'}
                </Button>
            </Box>
            <Box
                component="pre"
                sx={{
                    m: 0,
                    p: 2.5,
                    overflowX: 'auto',
                    maxWidth: '100%',
                    fontFamily: 'code',
                    fontSize: '14px',
                    lineHeight: 1.65,
                    color: 'text.primary',
                    ...tokenStyles,
                }}
            >
                {markup ? (
                    <code dangerouslySetInnerHTML={{ __html: markup }} />
                ) : (
                    <code>{content}</code>
                )}
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
                borderColor: 'page.border',
                // Широкая таблица прокручивается сама, а не растягивает страницу
                maxWidth: '100%',
                overflowX: 'auto',
                overflowY: 'hidden',
                WebkitOverflowScrolling: 'touch',
            }}
        >
            <Table
                sx={{
                    '--TableCell-headBackground': 'var(--dd-palette-background-level1)',
                    '--TableCell-paddingY': '12px',
                    '--TableCell-paddingX': '16px',
                    width: 'max-content',
                    minWidth: '100%',
                    '& th, & td': { whiteSpace: 'normal', minWidth: '132px' },
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

// Каждый блок получает краску курса: большинству она не нужна, но тест и
// чек-лист рисуют ею отметки, поэтому `ink` передаётся всем одинаково.
const renderers = {
    p: (block) => <Paragraph content={block.content} />,
    h2: (block) => <Heading level={2} content={block.content} />,
    h3: (block) => <Heading level={3} content={block.content} />,
    quote: (block) => <Quote content={block.content} />,
    note: (block) => <Note content={block.content} />,
    img: (block) => <Picture src={block.src} alt={block.alt} caption={block.caption} />,
    code: (block) => <CodeBlock content={block.content} language={block.language} />,
    ul: (block) => <List items={block.items || []} />,
    ol: (block) => <List ordered items={block.items || []} />,
    table: (block) => <DataTable head={block.head || []} rows={block.rows || []} />,
    quiz: (block, ink) => <LessonQuiz quiz={block.quiz} ink={ink} />,
    checklist: (block, ink) => (
        <Checklist title={block.title} items={block.items || []} ink={ink} />
    ),
    courses: (block) => <CourseList title={block.title} items={block.items || []} />,
}

export default function ContentBlocks({ blocks = [], ink }) {
    return (
        <Box sx={{ minWidth: 0, maxWidth: '100%', '& > *:first-of-type': { mt: 0 } }}>
            {blocks.map((block, index) => {
                const render = renderers[block.block]
                if (!render) return null
                return (
                    <Box key={index} sx={{ minWidth: 0, maxWidth: '100%' }}>
                        {render(block, ink)}
                    </Box>
                )
            })}
        </Box>
    )
}
