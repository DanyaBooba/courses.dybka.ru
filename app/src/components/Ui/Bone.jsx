import Box from '@mui/joy/Box'

/**
 * Кость скелета: плашка на месте будущего текста или картинки, пока данные
 * загружаются. Своя, а не Joy Skeleton: у Joy серый холодный и спорит с
 * тёплой бумагой. По плашке медленно прокатывается светлая волна.
 *
 *   <Bone width="60%" height={24} />      — строка
 *   <Bone sx={{ aspectRatio: '16 / 9' }} /> — картинка
 */
export default function Bone({ width = '100%', height = 16, sx }) {
    return (
        <Box
            aria-hidden
            sx={{
                width,
                height,
                position: 'relative',
                overflow: 'hidden',
                bgcolor: 'background.level1',
                '&::after': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    transform: 'translateX(-100%)',
                    background:
                        'linear-gradient(90deg, transparent 0%, color-mix(in srgb, var(--dd-palette-background-body) 55%, transparent) 50%, transparent 100%)',
                    animation: 'ddBone 1.6s ease-in-out infinite',
                },
                '@keyframes ddBone': {
                    '100%': { transform: 'translateX(100%)' },
                },
                '@media (prefers-reduced-motion: reduce)': {
                    '&::after': { display: 'none' },
                },
                ...sx,
            }}
        />
    )
}

/** Несколько строк абзаца: последняя короче, как у настоящего текста. */
export function BoneLines({ lines = 3, height = 14, gap = 1.25, sx }) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap, ...sx }}>
            {Array.from({ length: lines }, (_, index) => (
                <Bone key={index} height={height} width={index === lines - 1 ? '62%' : '100%'} />
            ))}
        </Box>
    )
}
