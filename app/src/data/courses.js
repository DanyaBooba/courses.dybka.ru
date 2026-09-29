// Курсы: схема и помощники.
//
// Курсы живут в базе: сайт и панель управления берут их из API (см. src/api/courses.js).
// Файлы src/data/courses/<id>.js — исходники, из которых курсы перенесены в базу
// (database/seed-courses.sql в репозитории API); сайт их больше не читает.
//
// Схема курса:
//   id        — слаг, он же часть адреса: /course/<id>
//   title     — название
//   subtitle  — короткое описание для карточки и шапки курса
//   accent    — цветовая тема карточки (см. src/theme/accents.js):
//               mint | lilac | peach | sky | rose | amber | teal | indigo |
//               unity | node | expo
//   section   — раздел каталога (см. src/data/sections.js):
//               unity | web | mobile
//   difficulty — сложность от 1 до 5, рисуется звёздами в карточке
//   disabled  — true, пока курс не готов: целиком его видят только администратор
//               и автор, остальным вместо уроков — плашка «Ведётся работа»
//   level     — уровень («Для начинающих»)
//   duration  — задуманный объём («10 уроков»), заметка для автора: в вёрстке
//               счётчик уроков считается по `pages`, а не по этому полю
//   image     — обложка курса или null (тогда блок обложки не рисуется совсем)
//   video     — видео для карточки или null; играет при наведении вместо обложки
//   chips     — теги для карточки
//   github    — ссылка на репозиторий или null
//   author    — { name, email, telegram }
//   certificate — путь до картинки сертификата или null
//   about     — блоки контента для страницы курса
//   pages     — уроки: [{ slug, title, short, certificate?, content: [блоки] }]
//               последней может лежать завершающая страница со слагом 'end' —
//               это итог курса (тест, чек-лист), а не урок: в счётчике уроков
//               она не участвует и в списках помечается отдельно
//
// Схема блока контента (см. src/components/Content/ContentBlocks.jsx):
//   { block: 'p',     content: 'текст' }
//   { block: 'h2',    content: 'заголовок' }      // и 'h3'
//   { block: 'img',   src: '/путь.jpg', alt: '', caption?: 'подпись' }
//                     src: null — на месте картинки рисуется плашка «ФОТО»
//   { block: 'quote', content: 'текст' }
//   { block: 'note',  content: 'текст' }
//   { block: 'code',  content: 'код', language: 'C#' }
//   { block: 'ul',    items: ['текст', { text: 'текст', items: ['вложенный'] }] }
//   { block: 'ol',    items: ['текст'] }
//   { block: 'table', head: ['колонка'], rows: [['ячейка']] }
//   { block: 'checklist', title: 'заголовок', items: ['пункт'] }
//   { block: 'courses', title?: 'заголовок', items: ['id-курса'] }
//                     подборка курсов карточками, как в каталоге на главной;
//                     порядок карточек — порядок id в списке
//   { block: 'quiz',  quiz: { title, intro, questions } }
//                     схема теста — в src/components/Quiz/quizSample.js
//
// В тексте блоков поддерживается упрощённый markdown: **жирный**, _курсив_,
// `код` и [ссылка](адрес).

/** Есть ли что показывать в обложке курса: фотография или видео. */
export function hasMedia(course) {
    return Boolean(course?.image || course?.video)
}

/**
 * Слаг завершающей страницы курса. Это не урок, а итог: тест и чек-лист.
 * Она лежит последней в `pages`, но из счётчика уроков исключается.
 */
export const FINAL_SLUG = 'end'

/** Только уроки, без завершающей страницы. */
export function getLessons(course) {
    if (!course) return []
    return course.pages.filter((page) => page.slug !== FINAL_SLUG)
}

/** Завершающая страница курса или null, если её нет. */
export function getFinalPage(course) {
    if (!course) return null
    return course.pages.find((page) => page.slug === FINAL_SLUG) ?? null
}

/** Название урока для меню и программы: короткое, а если его нет — полное. */
export function getShortTitle(page) {
    return page.short || page.title || 'Без названия'
}

export function getPage(course, slug) {
    if (!course) return null
    return course.pages.find((page) => page.slug === slug) ?? null
}

/** Соседние уроки для навигации «назад / вперёд». */
export function getNeighbours(course, slug) {
    if (!course) return { prev: null, next: null, index: -1 }
    const index = course.pages.findIndex((page) => page.slug === slug)
    return {
        index,
        prev: index > 0 ? course.pages[index - 1] : null,
        next: index >= 0 && index < course.pages.length - 1 ? course.pages[index + 1] : null,
    }
}
