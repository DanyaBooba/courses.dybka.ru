// Разделы каталога. Курс попадает в раздел через поле `section`.
//
// Порядок разделов здесь — порядок блоков на главной странице.

const sections = [
    {
        id: 'unity',
        title: 'Unity',
        note: 'Игры и интерактивные проекты на движке Unity',
    },
    {
        id: 'web',
        title: 'Веб-разработка',
        note: 'Вёрстка, JavaScript, серверная часть и фреймворки',
    },
    {
        id: 'mobile',
        title: 'Мобильная разработка',
        note: 'Приложения для телефона и публикация в маркеты',
    },
]

export default sections

/** Разделы с их курсами; пустые разделы в выдачу не попадают. */
export function groupBySection(courses) {
    const known = new Set(sections.map((section) => section.id))

    return sections
        .map((section) => ({
            ...section,
            courses: courses.filter((course) => course.section === section.id),
        }))
        .concat([
            {
                id: 'other',
                title: 'Остальное',
                note: null,
                courses: courses.filter((course) => !known.has(course.section)),
            },
        ])
        .filter((section) => section.courses.length > 0)
}
