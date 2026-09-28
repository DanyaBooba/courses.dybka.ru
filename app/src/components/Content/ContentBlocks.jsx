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
import {
    headingSx,
    headingLevel,
    paragraphSx,
    quoteSx,
    quoteTextSx,
    noteSx,
    noteTextSx,
    figureSx,
    captionSx,
    codeSheetSx,
    codeHeaderSx,
    codeLabelSx,
    codePreSx,
    listSx,
    tableSheetSx,
    tableSx,
    blocksSx,
    blockSx,
} from './blockStyles'

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
            level={headingLevel(level)}
            sx={{ ...headingSx(level), '&:hover .anchor': { opacity: 1 } }}
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
                        '@media (hover: hover)': {
                            '&:hover': { color: 'primary.plainColor' },
                        },
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
        <Typography sx={paragraphSx}>
            <InlineText text={content} />
        </Typography>
    )
}

function Quote({ content }) {
    return (
        <Box component="blockquote" sx={quoteSx}>
            <Typography sx={quoteTextSx}>
                <InlineText text={content} />
            </Typography>
        </Box>
    )
}

export function NoteIcon() {
    return (
        <Box aria-hidden sx={{ flexShrink: 0, mt: '2px', color: 'page.noteBar' }}>
            <LightbulbIcon size={22} weight="fill" />
        </Box>
    )
}

function Note({ content }) {
    return (
        <Sheet variant="plain" sx={noteSx}>
            <NoteIcon />
            <Typography sx={noteTextSx}>
                <InlineText text={content} />
            </Typography>
        </Sheet>
    )
}

/** Подпись под картинкой — только если она задана явно полем `caption`. */
function Caption({ text }) {
    if (!text) return null
    return (
        <Typography component="figcaption" sx={captionSx}>
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
    const frame = figureSx

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
        <Sheet variant="outlined" sx={codeSheetSx}>
            <Box sx={codeHeaderSx}>
                <Typography sx={codeLabelSx}>
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
            <Box component="pre" sx={{ ...codePreSx, ...tokenStyles }}>
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
        <Box component={ordered ? 'ol' : 'ul'} sx={listSx}>
            <ListItems items={items} />
        </Box>
    )
}

function DataTable({ head, rows }) {
    return (
        <Sheet variant="outlined" sx={tableSheetSx}>
            <Table sx={tableSx}>
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

/** Один блок контента без обёртки. Неизвестный тип блока не рисуется. */
export function ContentBlock({ block, ink }) {
    const render = renderers[block.block]
    return render ? render(block, ink) : null
}

export default function ContentBlocks({ blocks = [], ink }) {
    return (
        <Box sx={blocksSx}>
            {blocks.map((block, index) =>
                renderers[block.block] ? (
                    <Box key={index} sx={blockSx}>
                        <ContentBlock block={block} ink={ink} />
                    </Box>
                ) : null,
            )}
        </Box>
    )
}
