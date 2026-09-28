import Box from '@mui/joy/Box'
import Typography from '@mui/joy/Typography'
import { motion } from 'framer-motion'

import CourseCard from '../CourseCard/CourseCard'
import CourseCardSkeleton from '../CourseCard/CourseCardSkeleton'
import { useCourses } from '../../api/courses'

/**
 * Подборка курсов внутри урока — те же карточки, что в каталоге на главной.
 *
 * Курсы задаются списком `id`; порядок в списке и есть порядок карточек.
 * Неизвестные `id` молча пропускаются, чтобы опечатка в данных не ломала урок.
 * Закрытые курсы (`disabled: true`) не отфильтровываются: карточка сама
 * покажет, что над курсом ведётся работа — так же, как в каталоге.
 * Пока каталог грузится, на месте карточек стоят скелеты; если не загрузился —
 * подборка просто не показывается, урок читать это не мешает.
 */

const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06 } },
}

export default function CourseList({ title, items = [] }) {
    const { courses, loading } = useCourses()

    const picked = items
        .map((id) => courses?.find((course) => course.id === id))
        .filter(Boolean)

    if (!loading && !picked.length) return null

    return (
        <Box component="section" aria-label={title || 'Курсы'} sx={{ mt: title ? 6 : 4 }}>
            {title && (
                <Typography
                    level="h2"
                    sx={{
                        mb: 3,
                        pb: 1.25,
                        fontWeight: 500,
                        letterSpacing: '-0.02em',
                        borderBottom: '2px solid',
                        borderColor: 'page.rule',
                    }}
                >
                    {title}
                </Typography>
            )}

            <Box
                component={motion.div}
                variants={stagger}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.15 }}
                sx={{
                    display: 'grid',
                    gap: 2,
                    gridTemplateColumns: {
                        xs: 'minmax(0, 1fr)',
                        sm: 'repeat(2, minmax(0, 1fr))',
                    },
                }}
            >
                {loading
                    ? items.map((id) => <CourseCardSkeleton key={id} />)
                    : picked.map((course) => <CourseCard key={course.id} course={course} />)}
            </Box>
        </Box>
    )
}
