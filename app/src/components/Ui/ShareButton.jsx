import { useEffect, useRef, useState } from 'react'
import Button from '@mui/joy/Button'
import { CheckIcon, ShareNetworkIcon } from '@phosphor-icons/react'

/**
 * «Поделиться». На телефоне открывает системное меню «Поделиться» — там
 * мессенджеры и соцсети. На компьютере системное меню неудобно, поэтому
 * ссылка просто копируется в буфер обмена, а кнопка на пару секунд
 * говорит «Ссылка скопирована».
 *
 * `path` — адрес на сайте («/course/unity-first-game»), к нему добавляется домен.
 */
export default function ShareButton({ path, title, text, children = 'Поделиться', sx, ...props }) {
    const [copied, setCopied] = useState(false)
    const timer = useRef(null)

    useEffect(() => () => clearTimeout(timer.current), [])

    const share = async () => {
        const url = `${window.location.origin}${path}`
        const touch = window.matchMedia?.('(pointer: coarse)').matches

        if (touch && navigator.share) {
            try {
                await navigator.share({ title, text, url })
                return
            } catch (error) {
                // Человек закрыл меню — это не ошибка, копировать ничего не нужно
                if (error?.name === 'AbortError') return
            }
        }

        try {
            await navigator.clipboard.writeText(url)
            setCopied(true)
            clearTimeout(timer.current)
            timer.current = setTimeout(() => setCopied(false), 2000)
        } catch {
            // Буфер обмена недоступен (старый браузер, нет прав) — показываем ссылку
            window.prompt('Скопируйте ссылку', url)
        }
    }

    return (
        <Button
            onClick={share}
            startDecorator={copied ? <CheckIcon size={20} weight="bold" /> : <ShareNetworkIcon size={20} />}
            aria-live="polite"
            {...props}
            sx={sx}
        >
            {copied ? 'Ссылка скопирована' : children}
        </Button>
    )
}
