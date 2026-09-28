import Container from '@mui/joy/Container'

import PageShell from '../Layout/PageShell'
import LoadError from '../Ui/LoadError'
import WorkInProgress from './WorkInProgress'
import PageNotFound from '../../pages/PageNotFound'
import { isWip, useCourses } from '../../api/courses'

/**
 * Всё, что показывается вместо курса, пока его нет: скелет при загрузке,
 * плашка «Ведётся работа» для закрытого курса, 404 и ошибка связи.
 * Общая для страницы курса и страницы урока.
 */
export default function CourseState({ id, error, reload, skeleton }) {
    // Каталог нужен только плашке «Ведётся работа»: в нём есть название и цвет
    // закрытого курса. Обычно он уже в кэше — открыли курс с главной
    const { courses } = useCourses()

    if (isWip(error)) {
        return (
            <PageShell>
                <WorkInProgress course={courses?.find((course) => course.id === id)} />
            </PageShell>
        )
    }

    if (error?.status === 404) return <PageNotFound />

    if (error) {
        return (
            <PageShell>
                <Container maxWidth="lg" sx={{ px: { xs: 2.5, sm: 3 }, pt: { xs: 6, md: 10 } }}>
                    <LoadError title="Не получилось загрузить курс" error={error} onRetry={reload} />
                </Container>
            </PageShell>
        )
    }

    return <PageShell>{skeleton}</PageShell>
}
