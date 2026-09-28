import Box from '@mui/joy/Box'
import Button from '@mui/joy/Button'
import CircularProgress from '@mui/joy/CircularProgress'
import Tooltip from '@mui/joy/Tooltip'
import { CheckIcon, WarningCircleIcon } from '@phosphor-icons/react'

import { retrySave } from '../../admin/store'

const textSx = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.75,
    fontSize: 'xs',
    color: 'text.tertiary',
    whiteSpace: 'nowrap',
}

/** Состояние автосохранения программы — в верхней полосе страницы. */
export default function SaveStatus({ courseId, save, error }) {
    if (save === 'failed') {
        return (
            <Tooltip title={error?.message || 'Сервер не ответил'} size="sm" variant="soft" color="danger">
                <Button
                    size="sm"
                    variant="soft"
                    color="danger"
                    startDecorator={<WarningCircleIcon />}
                    onClick={() => retrySave(courseId)}
                >
                    Не сохранилось — повторить
                </Button>
            </Tooltip>
        )
    }

    if (save === 'saving' || save === 'pending') {
        return (
            <Box role="status" sx={textSx}>
                <CircularProgress size="sm" color="neutral" sx={{ '--CircularProgress-size': '14px', '--CircularProgress-trackThickness': '2px', '--CircularProgress-progressThickness': '2px' }} />
                Сохраняю…
            </Box>
        )
    }

    return (
        <Box role="status" sx={textSx}>
            <CheckIcon size={14} weight="bold" />
            Сохранено
        </Box>
    )
}
