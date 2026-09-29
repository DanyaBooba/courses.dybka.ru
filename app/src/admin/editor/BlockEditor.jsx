import { useEffect, useRef, useState } from 'react'
import Box from '@mui/joy/Box'
import Button from '@mui/joy/Button'
import Typography from '@mui/joy/Typography'
import { ImageIcon } from '@phosphor-icons/react'

import ContentBlocks, { ContentBlock } from '../../components/Content/ContentBlocks'
import { blockSx, blocksSx } from '../../components/Content/blockStyles'
import { BLOCK_TYPES, SHORTCUTS, TEXT_TYPES, isEmptyBlock, questionId } from '../blocks'
import { isFileDrag, pickImages, uploadImages } from '../uploads'
import { AddBlockMenu, BlockActionsMenu } from './BlockMenus'
import TextBlockEditor from './TextBlockEditor'
import ListEditor from './ListEditor'
import ImageEditor from './ImageEditor'
import CodeEditor from './CodeEditor'
import TableEditor from './TableEditor'
import { ChecklistEditor, CoursesEditor, QuizEditor } from './PanelEditors'

// Блок в новый тип: текст переезжает в новое поле, а не теряется
function convert(block, type, text = block.content ?? '') {
    if (TEXT_TYPES.includes(type)) return { block: type, content: text }
    if (type === 'ul' || type === 'ol') return { block: type, items: [text] }
    if (type === 'code') return { block: 'code', content: text, language: '' }
    return BLOCK_TYPES.find((item) => item.type === type).create()
}

// Копия блока. У теста новые id вопросов, иначе копия делила бы ответы с оригиналом
function duplicate(block) {
    const copy = structuredClone(block)
    if (copy.block === 'quiz') copy.quiz.questions.forEach((question) => (question.id = questionId()))
    return copy
}

const paragraph = (content = '') => ({ block: 'p', content })

/**
 * Редактор контента урока — холст в дизайне сайта. Блоки стоят ровно так, как
 * на странице урока; щелчок по блоку открывает его правку на месте.
 *
 * На полях у блока: «+» — вставить блок ниже, «⠿» — превратить, сдвинуть,
 * дублировать, удалить. Картинки перетаскиваются прямо на холст: встанут
 * туда, где видна линия. Их же можно вставить из буфера обмена.
 *
 * `preview` — только просмотр, без полей и рамок: страница как у читателя.
 */
export default function BlockEditor({ blocks, onChange, ink, preview = false }) {
    const containerRef = useRef(null)
    const [selected, setSelected] = useState(null)
    const [focus, setFocus] = useState(null)
    const [dropIndex, setDropIndex] = useState(null)
    // Номер запроса фокуса: каждый новый ставит курсор, даже в тот же блок
    const focusCounter = useRef(0)
    // Свежие блоки для правок после ожидания: пока фото загружалось, текст
    // могли поправить — вставка не должна откатить эти правки
    const latest = useRef(blocks)
    useEffect(() => {
        latest.current = blocks
    })

    const select = (index, caret = 'end') => {
        focusCounter.current += 1
        setSelected(index)
        setFocus({ index, caret, token: focusCounter.current })
    }

    // Щелчок мимо холста заканчивает правку. Меню и списки выбора живут в
    // отдельном слое поверх страницы — щелчок по ним правку не прерывает
    useEffect(() => {
        if (selected === null) return
        const onPointerDown = (event) => {
            if (containerRef.current?.contains(event.target)) return
            if (event.target.closest?.('[role="menu"], [role="listbox"], [role="option"], [data-editor-keep]')) return
            setSelected(null)
        }
        document.addEventListener('mousedown', onPointerDown)
        return () => document.removeEventListener('mousedown', onPointerDown)
    }, [selected])

    if (preview) return <ContentBlocks blocks={blocks} ink={ink} />

    // ── Правки ──────────────────────────────────────────────────────────

    const replace = (index, ...items) => {
        const next = [...latest.current]
        next.splice(index, 1, ...items)
        onChange(next.length ? next : [paragraph()])
    }

    const insert = (index, ...items) => {
        const next = [...latest.current]
        next.splice(index, 0, ...items)
        onChange(next)
    }

    // composing — текст ещё набирается через IME, before — текст до начала набора
    const update = (index, block, { composing = false, before } = {}) => {
        const prev = blocks[index]
        // Markdown-сокращение в только что начатом абзаце: «## » → заголовок и т. д.
        if (prev.block === 'p' && block.block === 'p' && !composing) {
            const typedFrom = before ?? prev.content
            const shortcut = SHORTCUTS.find(
                ({ prefix }) => block.content.startsWith(prefix) && typedFrom.length < prefix.length,
            )
            if (shortcut) {
                replace(index, convert(prev, shortcut.type, block.content.slice(shortcut.prefix.length)))
                select(index, 'end')
                return
            }
        }
        replace(index, block)
    }

    const remove = (index) => {
        replace(index)
        if (index > 0) select(index - 1, 'end')
        else setSelected(null)
    }

    const move = (index, step) => {
        const to = index + step
        if (to < 0 || to >= blocks.length) return
        const next = [...blocks]
        const [block] = next.splice(index, 1)
        next.splice(to, 0, block)
        onChange(next)
        setSelected(to)
    }

    const addAfter = (index, type) => {
        insert(index + 1, BLOCK_TYPES.find((item) => item.type === type).create())
        select(index + 1, 'start')
    }

    const insertImages = async (files, at) => {
        const urls = await uploadImages(files)
        if (!urls.length) return
        insert(at, ...urls.map((src) => ({ block: 'img', src, alt: '', caption: '' })))
        setSelected(null)
    }

    const pasteImages = (index) => (event) => {
        const files = pickImages(event.clipboardData?.files)
        if (!files.length) return
        event.preventDefault()
        insertImages(files, index + 1)
    }

    // Клавиши, общие для текстовых полей блока (см. keys.js)
    const keysFor = (index) => {
        const block = blocks[index]
        const prev = blocks[index - 1]
        return {
            // Enter: текст после курсора уезжает в новый абзац
            onSplit: (before, after) => {
                replace(index, { ...block, content: before }, paragraph(after))
                select(index + 1, 'start')
            },
            onBackspaceAtStart: (text) => {
                // Склеиваем с предыдущим текстовым блоком
                if (prev && TEXT_TYPES.includes(prev.block) && TEXT_TYPES.includes(block.block)) {
                    const next = [...blocks]
                    next.splice(index - 1, 2, { ...prev, content: prev.content + text })
                    onChange(next)
                    select(index - 1, prev.content.length)
                    return
                }
                // Заголовок, цитата, заметка сначала становятся обычным абзацем
                if (TEXT_TYPES.includes(block.block) && block.block !== 'p') {
                    replace(index, paragraph(text))
                    select(index, 'start')
                    return
                }
                if (isEmptyBlock(block)) remove(index)
                else if (prev) select(index - 1, 'end')
            },
            // Выход из списка: список режется абзацем
            onBreak: (before, text, after) => {
                const parts = [
                    before.length ? { ...block, items: before } : null,
                    paragraph(text),
                    after.length ? { ...block, items: after } : null,
                ].filter(Boolean)
                replace(index, ...parts)
                select(index + (before.length ? 1 : 0), 'start')
            },
            onPrev: index > 0 ? () => select(index - 1, 'end') : undefined,
            onNext: index < blocks.length - 1 ? () => select(index + 1, 'start') : undefined,
            onEscape: () => {
                setSelected(null)
                document.activeElement?.blur()
            },
        }
    }

    // ── Перетаскивание картинок на холст ────────────────────────────────

    // Куда встанет картинка: перед первым блоком, чья середина ниже курсора
    const indexAt = (clientY) => {
        const frames = containerRef.current?.querySelectorAll(':scope > [data-block-index]') ?? []
        for (const frame of frames) {
            const rect = frame.getBoundingClientRect()
            if (clientY < rect.top + rect.height / 2) return Number(frame.dataset.blockIndex)
        }
        return blocks.length
    }

    const dropHandlers = {
        onDragOver: (event) => {
            if (!isFileDrag(event)) return
            event.preventDefault()
            // Над пустой (или выбранной) картинкой файл займёт её саму — линия не нужна
            setDropIndex(event.target.closest('[data-own-drop]') ? null : indexAt(event.clientY))
        },
        onDragLeave: (event) => {
            if (!containerRef.current?.contains(event.relatedTarget)) setDropIndex(null)
        },
        onDrop: (event) => {
            if (!isFileDrag(event)) return
            event.preventDefault()
            const at = dropIndex ?? indexAt(event.clientY)
            setDropIndex(null)
            const files = pickImages(event.dataTransfer.files)
            if (files.length) insertImages(files, at)
        },
    }

    // ── Отрисовка ───────────────────────────────────────────────────────

    const renderEditor = (block, index, isSelected) => {
        const common = {
            block,
            onChange: (next, meta) => update(index, next, meta),
            focus: focus?.index === index ? focus : null,
            ink,
        }

        if (block.block === 'img') {
            return (
                <ImageEditor
                    {...common}
                    selected={isSelected}
                    onExtraImages={(files) => insertImages(files, index + 1)}
                />
            )
        }

        // Картинка правится всегда: пустую можно сразу заполнить, заполненная
        // выглядит как на сайте, а кнопки появляются, только когда она выбрана.
        // Остальные блоки правятся только выбранными: невыбранный — как на сайте.
        // Кроме пустого текста: на сайте он нулевой высоты, и в редакторе его было
        // бы не видно и не нажать — поэтому это сразу поле с подсказкой
        const editable = isSelected || (isEmptyBlock(block) && [...TEXT_TYPES, 'ul', 'ol'].includes(block.block))
        if (!editable) return <ContentBlock block={block} ink={ink} />

        const keys = keysFor(index)
        if (TEXT_TYPES.includes(block.block)) return <TextBlockEditor {...common} keys={keys} onPaste={pasteImages(index)} />
        if (block.block === 'ul' || block.block === 'ol') return <ListEditor {...common} keys={keys} onPaste={pasteImages(index)} />
        if (block.block === 'code') return <CodeEditor {...common} keys={keys} />
        if (block.block === 'table') return <TableEditor {...common} />
        if (block.block === 'checklist') return <ChecklistEditor {...common} />
        if (block.block === 'courses') return <CoursesEditor {...common} />
        if (block.block === 'quiz') return <QuizEditor {...common} />
        return <ContentBlock block={block} ink={ink} />
    }

    return (
        <Box ref={containerRef} {...dropHandlers} sx={{ ...blocksSx, position: 'relative' }}>
            {blocks.map((block, index) => {
                const isSelected = selected === index
                // Невыбранный блок нарисован как на сайте: его ссылки и кнопки не должны
                // срабатывать, щелчок только выбирает блок. Картинка — своя, ей можно
                const staticView = !isSelected && block.block !== 'img'

                return (
                    <Box
                        key={index}
                        data-block-index={index}
                        onClickCapture={(event) => {
                            // Кнопки на полях и пункты их меню (меню живёт в портале, но события
                            // React всплывают через него сюда же) работают сами по себе
                            if (!event.currentTarget.contains(event.target)) return
                            if (event.target.closest('.block-gutter')) return
                            if (isSelected) {
                                // Ссылки в правке не уводят со страницы
                                if (event.target.closest('a')) event.preventDefault()
                                return
                            }
                            if (staticView) {
                                event.preventDefault()
                                event.stopPropagation()
                            }
                            select(index, 'end')
                        }}
                        sx={{
                            ...blockSx,
                            position: 'relative',
                            cursor: staticView ? 'text' : undefined,
                            // Рамка вокруг блока: пунктир при наведении, линия у выбранного
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                inset: { xs: '-6px -8px', md: '-8px -14px' },
                                border: '1px solid',
                                borderColor: isSelected ? 'page.rule' : 'transparent',
                                borderStyle: isSelected ? 'solid' : 'dashed',
                                opacity: isSelected ? 0.35 : 1,
                                pointerEvents: 'none',
                                transition: 'border-color 0.15s ease',
                            },
                            '@media (hover: hover)': {
                                '&:hover::before': { borderColor: isSelected ? 'page.rule' : 'page.border' },
                                '&:hover .block-gutter': { opacity: 1 },
                            },
                        }}
                    >
                        {dropIndex === index && <DropLine />}

                        <Box
                            className="block-gutter"
                            sx={{
                                position: 'absolute',
                                zIndex: 2,
                                top: { xs: -34, md: -2 },
                                right: { xs: -8, md: 'calc(100% + 18px)' },
                                display: 'flex',
                                gap: 0.25,
                                opacity: isSelected ? 1 : 0,
                                transition: 'opacity 0.15s ease',
                                '&:focus-within': { opacity: 1 },
                            }}
                        >
                            <AddBlockMenu onPick={(type) => addAfter(index, type)} />
                            <BlockActionsMenu
                                block={block}
                                isFirst={index === 0}
                                isLast={index === blocks.length - 1}
                                onConvert={(type) => {
                                    replace(index, convert(block, type))
                                    select(index, 'end')
                                }}
                                onMove={(step) => move(index, step)}
                                onDuplicate={() => {
                                    insert(index + 1, duplicate(block))
                                    setSelected(index + 1)
                                }}
                                onRemove={() => remove(index)}
                            />
                        </Box>

                        {renderEditor(block, index, isSelected)}
                    </Box>
                )
            })}

            <AddBar
                showLine={dropIndex === blocks.length}
                onAdd={(type) => {
                    const last = blocks[blocks.length - 1]
                    // Щелчок по пустому месту в конце: пустой последний абзац просто получает фокус
                    if (type === 'p' && last?.block === 'p' && !last.content) {
                        select(blocks.length - 1, 'end')
                        return
                    }
                    addAfter(blocks.length - 1, type)
                }}
            />
        </Box>
    )
}

/** Линия «картинка встанет сюда», пока над холстом держат файл. */
function DropLine() {
    return (
        <Box
            aria-hidden
            data-drop-line
            sx={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: -14,
                height: '3px',
                bgcolor: 'page.accentInk',
                pointerEvents: 'none',
                '&::before': {
                    content: '"Картинка встанет сюда"',
                    position: 'absolute',
                    left: 0,
                    top: -22,
                    fontFamily: 'code',
                    fontSize: '11px',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'page.accentInk',
                    whiteSpace: 'nowrap',
                },
            }}
        />
    )
}

/** Конец холста: быстрые кнопки для всех типов блоков и подсказка про картинки. */
function AddBar({ onAdd, showLine }) {
    return (
        <Box sx={{ position: 'relative', mt: 5 }}>
            {showLine && <DropLine />}
            <Box
                onClick={(event) => {
                    if (event.target === event.currentTarget) onAdd('p')
                }}
                sx={{
                    p: 2,
                    border: '1px dashed',
                    borderColor: 'page.border',
                    cursor: 'text',
                }}
            >
                <Typography
                    sx={{
                        mb: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        fontSize: 'sm',
                        color: 'text.tertiary',
                        pointerEvents: 'none',
                    }}
                >
                    <ImageIcon size={18} />
                    Добавьте блок или перетащите фотографии прямо на страницу
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                    {BLOCK_TYPES.map(({ type, label, icon: Icon }) => (
                        <Button
                            key={type}
                            size="sm"
                            variant="outlined"
                            color="neutral"
                            startDecorator={<Icon size={16} />}
                            onClick={() => onAdd(type)}
                            sx={{
                                fontWeight: 500,
                                borderColor: 'page.border',
                                color: 'text.secondary',
                                bgcolor: 'background.body',
                                '&:hover': { bgcolor: 'background.level1', color: 'text.primary' },
                            }}
                        >
                            {label}
                        </Button>
                    ))}
                </Box>
            </Box>
        </Box>
    )
}
