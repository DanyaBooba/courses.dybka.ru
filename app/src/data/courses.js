// Реестр курсов.
//
// Каждый курс живёт в отдельном файле в src/data/courses/<id>.js и экспортирует
// объект курса по умолчанию. Здесь курсы только собираются в общий список —
// чтобы добавить курс, достаточно создать файл и дописать его в массив ниже.
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
//   disabled  — true, пока курс не готов: карточка в каталоге неактивна,
//               страницы курса и уроков по прямой ссылке отдают 404
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

import unityFirstGame from './courses/unity-first-game'
import htmlCssFirstSite from './courses/html-css-first-site'
import vanillaJavascript from './courses/vanilla-javascript'
import phpMysql from './courses/php-mysql'
import gulpWorkflow from './courses/gulp-workflow'
import webMedia from './courses/web-media'
import unityAr from './courses/unity-ar'
import unityVr from './courses/unity-vr'
import mobileApp from './courses/mobile-app'
import storePublishing from './courses/store-publishing'
import reactSite from './courses/react-site'
import nodejsApi from './courses/nodejs-api'
import laravelSite from './courses/laravel-site'
import fullstackReactNode from './courses/fullstack-react-node'

const courses = [
    unityFirstGame,
    unityAr,
    unityVr,
    htmlCssFirstSite,
    vanillaJavascript,
    gulpWorkflow,
    reactSite,
    nodejsApi,
    fullstackReactNode,
    laravelSite,
    mobileApp,
    storePublishing,
    phpMysql,
    webMedia,
]

export default courses

/**
 * Курс по слагу. Закрытые курсы (`disabled: true`) наружу не отдаются: их
 * карточки не кликаются, и по прямой ссылке открываться они тоже не должны —
 * иначе человек попадёт на страницу с пустым планом уроков.
 */
export function getCourse(id) {
    const course = courses.find((item) => item.id === id) ?? null
    return course && !course.disabled ? course : null
}

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
