import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Box from '@mui/joy/Box'
import Button from '@mui/joy/Button'
import Typography from '@mui/joy/Typography'

import AdminTopBar from './AdminTopBar'
import CourseForm from './CourseForm'
import { blankCourse, courseIdError, createCourse, useAdminCourses, useCanPublish } from '../../admin/store'
import { useProfile } from '../../api/courses'
import toSlug from '../../admin/slug'

/**
 * Новая программа: настройки и живая карточка. Адрес подставляется из
 * названия, пока его не поправили руками. После создания — сразу на
 * страницу программы, писать описание и уроки.
 */
export default function PageAdminNewCourse() {
    const navigate = useNavigate()
    const { user } = useProfile()
    const canPublish = useCanPublish()
    const [course, setCourse] = useState(() => blankCourse(user))
    const [idTouched, setIdTouched] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [creating, setCreating] = useState(false)
    const [serverError, setServerError] = useState(null)
    const { courses } = useAdminCourses()

    useEffect(() => {
        document.title = 'Новая программа — courses.dybka.ru'
    }, [])

    const idError = courseIdError(course.id, courses)
    const titleMissing = !course.title.trim()
    // Пустой адрес — ещё не ошибка, пока не пытались создать; занятый — сразу
    const shownIdError = course.id || submitted ? idError : null

    const change = (next) => {
        setCourse(idTouched ? next : { ...next, id: toSlug(next.title) })
    }

    const create = async () => {
        setSubmitted(true)
        setServerError(null)
        if (titleMissing || idError || creating) return
        setCreating(true)
        try {
            const id = await createCourse({ ...course, title: course.title.trim(), subtitle: course.subtitle.trim() })
            navigate(`/admin/course/${id}`)
        } catch (error) {
            setServerError(error.message)
            setCreating(false)
        }
    }

    return (
        <>
            <AdminTopBar crumbs={[{ label: 'Программы', to: '/admin' }, { label: 'Новая программа' }]}>
                <Button size="sm" onClick={create} loading={creating}>
                    Создать программу
                </Button>
            </AdminTopBar>

            <Box sx={{ px: { xs: 2, md: 5 }, py: { xs: 3, md: 5 }, maxWidth: 1200 }}>
                <Typography level="h1" sx={{ fontWeight: 450, letterSpacing: '-0.03em', fontSize: { xs: '34px', md: '46px' } }}>
                    Новая программа
                </Typography>
                <Typography sx={{ mt: 1, mb: 4, color: 'text.secondary', maxWidth: 620, lineHeight: 1.65 }}>
                    Начните с названия и описания — остальное можно поменять потом. Новая программа скрыта от читателей, пока вы её не откроете.
                </Typography>

                {((submitted && titleMissing) || serverError) && (
                    <Typography role="alert" sx={{ mb: 2, color: 'danger.plainColor' }}>
                        {serverError ?? 'Заполните название программы.'}
                    </Typography>
                )}

                <CourseForm
                    course={course}
                    onChange={change}
                    idEditable
                    canPublish={canPublish}
                    idError={shownIdError}
                    onIdChange={(id) => {
                        setIdTouched(true)
                        setCourse({ ...course, id: id.toLowerCase() })
                    }}
                />

                <Button size="lg" onClick={create} loading={creating} sx={{ mt: 4, px: 4, fontWeight: 700 }}>
                    Создать программу
                </Button>
            </Box>
        </>
    )
}
