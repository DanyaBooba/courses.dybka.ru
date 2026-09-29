// SEO страниц: заголовок, описание, Open Graph и разметка schema.org (JSON-LD).
//
// Здесь только чистые функции: по данным страницы они возвращают описание
// тегов `{ title, description, url, image, type, robots, jsonLd }`. В <head>
// его кладёт хук useSeo. Без React и браузера — чтобы тот же код могли
// переиспользовать пререндер или сервер.

export const SITE_URL = 'https://courses.dybka.ru'
export const SITE_NAME = 'courses.dybka.ru'
const SITE_TITLE = 'courses.dybka.ru — бесплатные открытые курсы по программированию'
const SITE_DESCRIPTION =
    'Бесплатные открытые курсы по программированию: разработка игр на Unity, вёрстка сайтов и основы кода.'
// Картинка для превью ссылки, когда у страницы нет своей. Лучше всего — 1200×630
const DEFAULT_IMAGE = '/img/courses/html-css-first-site/cover.jpg'

const FOUNDER = {
    '@type': 'Person',
    name: 'Даниил Дыбка',
    email: 'daniil@dybka.ru',
    sameAs: ['https://ddybka.t.me'],
}

const ORGANIZATION = {
    '@type': 'EducationalOrganization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.svg`,
    email: 'daniil@dybka.ru',
    founder: FOUNDER,
    sameAs: ['https://ddybka.t.me'],
}

/** Абсолютный адрес: соцсети и поисковики не понимают относительные. */
export function absoluteUrl(path) {
    if (!path) return null
    if (/^https?:\/\//.test(path)) return path
    return `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`
}

/** Текст без inline-markdown: **жирный**, _курсив_, `код`, [ссылка](адрес). */
function plain(text) {
    return String(text ?? '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/_([^_]+)_/g, '$1')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\s+/g, ' ')
        .trim()
}

/** Обрезает текст до длины сниппета, не разрывая слово. */
function clip(text, max = 160) {
    if (text.length <= max) return text
    const cut = text.slice(0, max - 1)
    return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[\s,.;:—-]+$/, '')}…`
}

/** Описание из первых абзацев контента — для уроков, у которых нет своего. */
function describeBlocks(blocks) {
    const text = (blocks ?? [])
        .filter((block) => block.block === 'p' && block.content)
        .slice(0, 3)
        .map((block) => plain(block.content))
        .join(' ')
    return text ? clip(text) : null
}

function breadcrumbs(items) {
    return {
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: absoluteUrl(item.path),
        })),
    }
}

const graph = (...nodes) => ({ '@context': 'https://schema.org', '@graph': nodes })

// ── Страницы ────────────────────────────────────────────────────────────

/** Главная: организация, сайт и список курсов. */
export function homeSeo(courses) {
    const open = (courses ?? []).filter((course) => !course.disabled)

    return {
        title: SITE_TITLE,
        description: SITE_DESCRIPTION,
        url: absoluteUrl('/'),
        image: absoluteUrl(DEFAULT_IMAGE),
        type: 'website',
        jsonLd: graph(
            ORGANIZATION,
            {
                '@type': 'WebSite',
                '@id': `${SITE_URL}/#website`,
                name: SITE_NAME,
                url: SITE_URL,
                inLanguage: 'ru',
                publisher: { '@id': ORGANIZATION['@id'] },
            },
            ...(open.length
                ? [
                      {
                          '@type': 'ItemList',
                          itemListElement: open.map((course, index) => ({
                              '@type': 'ListItem',
                              position: index + 1,
                              url: absoluteUrl(`/course/${course.id}`),
                          })),
                      },
                  ]
                : []),
        ),
    }
}

/** Страница курса: Course с бесплатным доступом и хлебные крошки. */
export function courseSeo(course) {
    const path = `/course/${course.id}`
    const description = clip(plain(course.subtitle)) || SITE_DESCRIPTION
    const image = absoluteUrl(course.image) ?? absoluteUrl(DEFAULT_IMAGE)
    const author = course.author?.name
        ? {
              '@type': 'Person',
              name: course.author.name,
              ...(course.author.telegram ? { sameAs: [course.author.telegram] } : {}),
          }
        : FOUNDER

    return {
        title: `${course.title} — ${SITE_NAME}`,
        description,
        url: absoluteUrl(path),
        image,
        type: 'website',
        robots: course.disabled ? 'noindex' : null,
        jsonLd: graph(
            {
                '@type': 'Course',
                '@id': `${absoluteUrl(path)}#course`,
                name: course.title,
                description,
                url: absoluteUrl(path),
                image,
                inLanguage: 'ru',
                isAccessibleForFree: true,
                provider: ORGANIZATION,
                author,
                ...(course.level ? { coursePrerequisites: course.level } : {}),
                ...(course.chips?.length ? { teaches: course.chips } : {}),
                ...(course.updatedAt ? { dateModified: course.updatedAt } : {}),
                offers: { '@type': 'Offer', category: 'Free', price: 0, priceCurrency: 'RUB' },
                hasCourseInstance: { '@type': 'CourseInstance', courseMode: 'Online' },
            },
            breadcrumbs([
                { name: 'Курсы', path: '/' },
                { name: course.title, path },
            ]),
        ),
    }
}

/** Урок: учебный материал внутри курса и хлебные крошки. */
export function lessonSeo(course, page, position) {
    const coursePath = `/course/${course.id}`
    const path = `${coursePath}/${page.slug}`
    const title = page.title || page.short || 'Урок'
    const description = describeBlocks(page.content) ?? (clip(plain(course.subtitle)) || SITE_DESCRIPTION)
    const firstImage = (page.content ?? []).find((block) => block.block === 'img' && block.src)?.src
    const image = absoluteUrl(firstImage) ?? absoluteUrl(course.image) ?? absoluteUrl(DEFAULT_IMAGE)

    return {
        title: `${title} — ${course.title}`,
        description,
        url: absoluteUrl(path),
        image,
        type: 'article',
        robots: course.disabled ? 'noindex' : null,
        jsonLd: graph(
            {
                '@type': 'LearningResource',
                name: title,
                description,
                url: absoluteUrl(path),
                image,
                inLanguage: 'ru',
                learningResourceType: 'Урок',
                isAccessibleForFree: true,
                ...(position > 0 ? { position } : {}),
                isPartOf: { '@type': 'Course', '@id': `${absoluteUrl(coursePath)}#course`, name: course.title },
                publisher: ORGANIZATION,
            },
            breadcrumbs([
                { name: 'Курсы', path: '/' },
                { name: course.title, path: coursePath },
                { name: title, path },
            ]),
        ),
    }
}

/** Простая страница: правовые документы и прочее. */
export function pageSeo({ title, description, path }) {
    return {
        title: `${title} — ${SITE_NAME}`,
        description: description ?? SITE_DESCRIPTION,
        url: absoluteUrl(path),
        image: absoluteUrl(DEFAULT_IMAGE),
        type: 'website',
    }
}

/** Страница, которую не нужно индексировать: 404, вход, панель управления. */
export function hiddenSeo(title) {
    return { title, description: SITE_DESCRIPTION, robots: 'noindex, nofollow' }
}
