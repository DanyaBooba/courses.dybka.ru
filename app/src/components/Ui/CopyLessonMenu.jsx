import { useEffect, useRef, useState } from 'react'
import Dropdown from '@mui/joy/Dropdown'
import MenuButton from '@mui/joy/MenuButton'
import Menu from '@mui/joy/Menu'
import MenuItem from '@mui/joy/MenuItem'
import ListItemDecorator from '@mui/joy/ListItemDecorator'
import { CaretDownIcon, CheckIcon, CopyIcon, FileHtmlIcon, MarkdownLogoIcon } from '@phosphor-icons/react'

import { lessonToHtml, lessonToMarkdown } from '../Content/lessonExport'

// Старые браузеры и страницы без прав на буфер обмена: копируем через выделение
function copyFallback(text) {
    const area = document.createElement('textarea')
    area.value = text
    area.setAttribute('readonly', '')
    area.style.position = 'fixed'
    area.style.opacity = '0'
    document.body.appendChild(area)
    area.select()
    const ok = document.execCommand('copy')
    area.remove()
    return ok
}

/**
 * «Скопировать» в углу урока: весь урок в Markdown или HTML-разметкой —
 * чтобы вставить в заметки, в свой сайт или в чат с нейросетью.
 * После копирования кнопка на пару секунд говорит «Скопировано».
 */
export default function CopyLessonMenu({ page, sx }) {
    const [copied, setCopied] = useState(false)
    const timer = useRef(null)

    useEffect(() => () => clearTimeout(timer.current), [])

    const copy = async (text) => {
        let ok = true
        try {
            await navigator.clipboard.writeText(text)
        } catch {
            ok = copyFallback(text)
        }
        if (!ok) return
        setCopied(true)
        clearTimeout(timer.current)
        timer.current = setTimeout(() => setCopied(false), 2000)
    }

    return (
        <Dropdown>
            <MenuButton
                size="sm"
                variant="outlined"
                color="neutral"
                startDecorator={copied ? <CheckIcon size={16} weight="bold" /> : <CopyIcon size={16} />}
                endDecorator={<CaretDownIcon size={12} weight="bold" />}
                aria-live="polite"
                sx={{ fontWeight: 500, borderColor: 'page.border', color: 'text.secondary', bgcolor: 'background.body', ...sx }}
            >
                {copied ? 'Скопировано' : 'Скопировать'}
            </MenuButton>
            <Menu placement="bottom-end" size="sm" sx={{ minWidth: 220, '--ListItemDecorator-size': '32px', zIndex: 1400 }}>
                <MenuItem onClick={() => copy(lessonToMarkdown(page))}>
                    <ListItemDecorator>
                        <MarkdownLogoIcon size={18} />
                    </ListItemDecorator>
                    Скопировать Markdown
                </MenuItem>
                <MenuItem onClick={() => copy(lessonToHtml(page))}>
                    <ListItemDecorator>
                        <FileHtmlIcon size={18} />
                    </ListItemDecorator>
                    Скопировать HTML
                </MenuItem>
            </Menu>
        </Dropdown>
    )
}
