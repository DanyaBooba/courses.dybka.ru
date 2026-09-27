import Box from '@mui/joy/Box'
import { StarIcon } from '@phosphor-icons/react'

const labels = {
    1: 'Очень просто',
    2: 'Просто',
    3: 'Средне',
    4: 'Сложно',
    5: 'Очень сложно',
}

/** Сложность курса — пять звёзд, залитых по значению `course.difficulty`. */
export default function Difficulty({ value = 1, color = 'currentColor', size = 15, sx }) {
    const level = Math.max(0, Math.min(5, Math.round(value)))

    return (
        <Box
            title={`Сложность: ${level} из 5 — ${labels[level] ?? '—'}`}
            aria-label={`Сложность ${level} из 5`}
            sx={{ display: 'inline-flex', alignItems: 'center', gap: '2px', color, ...sx }}
        >
            {[1, 2, 3, 4, 5].map((star) => (
                <Box
                    key={star}
                    aria-hidden
                    component="span"
                    sx={{ display: 'inline-flex', opacity: star <= level ? 1 : 0.28 }}
                >
                    <StarIcon size={size} weight={star <= level ? 'fill' : 'regular'} />
                </Box>
            ))}
        </Box>
    )
}
