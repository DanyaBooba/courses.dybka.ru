import { useState } from 'react'
import Box from '@mui/joy/Box'
import Button from '@mui/joy/Button'
import Chip from '@mui/joy/Chip'
import DialogActions from '@mui/joy/DialogActions'
import DialogContent from '@mui/joy/DialogContent'
import DialogTitle from '@mui/joy/DialogTitle'
import Modal from '@mui/joy/Modal'
import ModalDialog from '@mui/joy/ModalDialog'
import Textarea from '@mui/joy/Textarea'
import Tooltip from '@mui/joy/Tooltip'
import { ArrowUDownLeftIcon, CheckIcon, EyeIcon, EyeSlashIcon, HourglassIcon, PaperPlaneTiltIcon } from '@phosphor-icons/react'

import { notify } from '../../admin/notices'
import { cancelReview, requestReview } from '../../admin/store'

const chipSx = { fontFamily: 'body' }

/**
 * Открыт ли курс читателям — в верхней полосе программы.
 *
 * Администратор открывает и скрывает курс сам, а курс, который ждёт
 * проверки, публикует или возвращает автору на доработку с причиной.
 * Автор (`canPublish = false`) скрывает свой курс сам, а открыть его
 * может только через проверку: «Отправить на проверку» — и ждать.
 */
export default function CourseStatus({ course, set, canPublish }) {
    const [busy, setBusy] = useState(false)
    const [declining, setDeclining] = useState(false)
    const pending = course.disabled && Boolean(course.reviewRequestedAt)

    const run = async (action) => {
        setBusy(true)
        try {
            await action()
        } catch (error) {
            notify(error.message)
        } finally {
            setBusy(false)
        }
    }

    const hide = () => {
        if (!canPublish && !window.confirm('Скрыть курс от читателей? Открыть его снова можно будет только после проверки администратором.')) return
        set({ disabled: true })
    }

    if (!course.disabled) {
        return (
            <Chip size="sm" variant="soft" color="neutral" startDecorator={<EyeIcon />} onClick={hide} sx={chipSx}>
                Доступен читателям
            </Chip>
        )
    }

    if (canPublish) {
        if (!pending) {
            return (
                <Chip size="sm" variant="soft" color="neutral" startDecorator={<EyeSlashIcon />} onClick={() => set({ disabled: false })} sx={chipSx}>
                    Скрыт от читателей
                </Chip>
            )
        }

        return (
            <>
                <Chip size="sm" variant="soft" color="warning" startDecorator={<HourglassIcon />} sx={chipSx}>
                    Ждёт проверки
                </Chip>
                <Button size="sm" color="success" startDecorator={<CheckIcon weight="bold" />} onClick={() => set({ disabled: false })} sx={{ fontWeight: 700 }}>
                    Опубликовать
                </Button>
                <Button
                    size="sm"
                    variant="outlined"
                    color="neutral"
                    startDecorator={<ArrowUDownLeftIcon />}
                    onClick={() => setDeclining(true)}
                    sx={{ fontWeight: 500 }}
                >
                    На доработку
                </Button>
                <DeclineDialog
                    open={declining}
                    busy={busy}
                    onClose={() => setDeclining(false)}
                    onSubmit={(reason) =>
                        run(async () => {
                            await cancelReview(course.id, reason)
                            setDeclining(false)
                        })
                    }
                />
            </>
        )
    }

    if (pending) {
        return (
            <>
                <Tooltip title="Администратор получил письмо. Как только он опубликует курс, придёт ответ на почту" size="sm" variant="soft">
                    <Chip size="sm" variant="soft" color="warning" startDecorator={<HourglassIcon />} sx={chipSx}>
                        На проверке
                    </Chip>
                </Tooltip>
                <Button size="sm" variant="plain" color="neutral" loading={busy} onClick={() => run(() => cancelReview(course.id))} sx={{ fontWeight: 500 }}>
                    Отозвать
                </Button>
            </>
        )
    }

    return (
        <>
            <Chip size="sm" variant="soft" color="neutral" startDecorator={<EyeSlashIcon />} sx={chipSx}>
                Скрыта
            </Chip>
            <Tooltip title="Курс откроется читателям, когда его проверит администратор" size="sm" variant="soft">
                <Button
                    size="sm"
                    startDecorator={<PaperPlaneTiltIcon />}
                    loading={busy}
                    onClick={() => run(() => requestReview(course.id))}
                    sx={{ fontWeight: 700 }}
                >
                    Отправить на проверку
                </Button>
            </Tooltip>
        </>
    )
}

/** Причина, по которой курс вернули: она уйдёт автору в письме. */
function DeclineDialog({ open, busy, onClose, onSubmit }) {
    const [reason, setReason] = useState('')

    return (
        <Modal open={open} onClose={onClose}>
            <ModalDialog sx={{ width: 'min(520px, calc(100vw - 32px))' }}>
                <DialogTitle>Вернуть курс на доработку</DialogTitle>
                <DialogContent>
                    Автору придёт письмо. Напишите, что поправить, — это попадёт в письмо.
                </DialogContent>
                <Box
                    component="form"
                    onSubmit={(event) => {
                        event.preventDefault()
                        onSubmit(reason)
                    }}
                >
                    <Textarea
                        autoFocus
                        minRows={3}
                        value={reason}
                        onChange={(event) => setReason(event.target.value)}
                        placeholder="Например: во втором уроке не хватает картинок"
                        sx={{ boxShadow: 'none' }}
                    />
                    <DialogActions sx={{ mt: 2 }}>
                        <Button type="submit" loading={busy} sx={{ fontWeight: 700 }}>
                            Вернуть автору
                        </Button>
                        <Button variant="plain" color="neutral" onClick={onClose}>
                            Отмена
                        </Button>
                    </DialogActions>
                </Box>
            </ModalDialog>
        </Modal>
    )
}
