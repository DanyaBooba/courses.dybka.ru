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
//               mint | lilac | peach | sky | rose | amber | teal | indigo
//   level     — уровень («Для начинающих»)
//   duration  — объём («10 уроков»)
//   chips     — теги для карточки
//   github    — ссылка на репозиторий или null
//   author    — { name, email, telegram }
//   certificate — путь до картинки сертификата или null
//   about     — блоки контента для страницы курса
//   pages     — уроки: [{ slug, title, short, certificate?, content: [блоки] }]
//
// Схема блока контента (см. src/components/Content/ContentBlocks.jsx):
//   { block: 'p',     content: 'текст' }
//   { block: 'h2',    content: 'заголовок' }      // и 'h3'
//   { block: 'img',   src: '/путь.jpg', alt: '' }
//   { block: 'quote', content: 'текст' }
//   { block: 'note',  content: 'текст' }
//   { block: 'code',  content: 'код', language: 'C#' }
//   { block: 'ul',    items: ['текст', { text: 'текст', items: ['вложенный'] }] }
//   { block: 'ol',    items: ['текст'] }
//   { block: 'table', head: ['колонка'], rows: [['ячейка']] }
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
    htmlCssFirstSite,
    vanillaJavascript,
    phpMysql,
    gulpWorkflow,
    webMedia,
    unityAr,
    unityVr,
    mobileApp,
    storePublishing,
    reactSite,
    nodejsApi,
    laravelSite,
    fullstackReactNode,
]

export default courses

export function getCourse(id) {
    return courses.find((course) => course.id === id) ?? null
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
