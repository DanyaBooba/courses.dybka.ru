import { useEffect, useRef } from 'react'
import Box from '@mui/joy/Box'

/**
 * Обложка курса: фотография `course.image`. Если у курса задано `course.video`,
 * то при `playing` вместо фотографии проигрывается видео (без звука, по кругу),
 * а по окончании наведения возвращается фотография.
 *
 * Если ни фотографии, ни видео нет — блок не рисуется совсем, никакой заглушки:
 * карточка просто начинается с шапки.
 */
export default function CourseMedia({ course, skin, ratio = '16 / 9', playing = false, rounded = false }) {
    const videoRef = useRef(null)
    const hasVideo = Boolean(course.video)
    const hasImage = Boolean(course.image)

    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        if (playing) {
            video.currentTime = 0
            const started = video.play()
            // play() отклоняется, если браузер запретил автозапуск — это не ошибка
            if (started?.catch) started.catch(() => { })
        } else {
            video.pause()
            video.currentTime = 0
        }
    }, [playing])

    if (!hasImage && !hasVideo) return null

    return (
        <Box
            sx={{
                position: 'relative',
                aspectRatio: ratio,
                overflow: 'hidden',
                borderRadius: rounded ? 'md' : 0,
                bgcolor: skin.chip,
                // border: rounded ? '1px solid' : 'none',
                // borderBottom: '1px solid',
                borderColor: skin.rule,
            }}
        >
            {hasImage && (
                <Box
                    component="img"
                    src={course.image}
                    alt={course.title}
                    loading="lazy"
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                    }}
                />
            )}

            {hasVideo && (
                <Box
                    component="video"
                    ref={videoRef}
                    src={course.video}
                    poster={course.image || undefined}
                    muted
                    loop
                    playsInline
                    preload="none"
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                        // Без фотографии видео — единственное содержимое обложки,
                        // поэтому показываем его всегда, а не только при наведении
                        opacity: playing || !hasImage ? 1 : 0,
                        transition: 'opacity 0.28s ease',
                    }}
                />
            )}
        </Box>
    )
}
