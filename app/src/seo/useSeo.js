import { useEffect } from 'react'

import { SITE_NAME } from './seo'

// Кладёт SEO страницы в <head>: заголовок, описание, canonical, Open Graph,
// Twitter-карточку, robots и JSON-LD. Теги из index.html не дублируются, а
// обновляются: у них те же name/property, что ищет хук.

function setMeta(attr, key, content) {
    let el = document.head.querySelector(`meta[${attr}="${key}"]`)
    if (!content) {
        el?.remove()
        return
    }
    if (!el) {
        el = document.createElement('meta')
        el.setAttribute(attr, key)
        document.head.appendChild(el)
    }
    el.setAttribute('content', content)
}

function setCanonical(url) {
    let el = document.head.querySelector('link[rel="canonical"]')
    if (!url) {
        el?.remove()
        return
    }
    if (!el) {
        el = document.createElement('link')
        el.rel = 'canonical'
        document.head.appendChild(el)
    }
    el.href = url
}

function setJsonLd(data) {
    let el = document.getElementById('seo-jsonld')
    if (!data) {
        el?.remove()
        return
    }
    if (!el) {
        el = document.createElement('script')
        el.type = 'application/ld+json'
        el.id = 'seo-jsonld'
        document.head.appendChild(el)
    }
    el.textContent = JSON.stringify(data)
}

/** `seo` — результат одной из функций seo.js или null, пока данных нет. */
export default function useSeo(seo) {
    const key = seo ? JSON.stringify(seo) : null

    useEffect(() => {
        if (!seo) return
        const { title, description, url, image, type, robots, jsonLd } = seo

        document.title = title
        setMeta('name', 'description', description)
        setMeta('name', 'robots', robots)
        setCanonical(url)

        setMeta('property', 'og:site_name', SITE_NAME)
        setMeta('property', 'og:locale', 'ru_RU')
        setMeta('property', 'og:type', type ?? 'website')
        setMeta('property', 'og:title', title)
        setMeta('property', 'og:description', description)
        setMeta('property', 'og:url', url)
        setMeta('property', 'og:image', image)

        setMeta('name', 'twitter:card', image ? 'summary_large_image' : 'summary')
        setMeta('name', 'twitter:title', title)
        setMeta('name', 'twitter:description', description)
        setMeta('name', 'twitter:image', image)

        setJsonLd(jsonLd)
        // seo — новый объект на каждый рендер, сравниваем по содержимому
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key])
}

/** Только запрет индексации — для страниц, которые сами ставят себе заголовок (панель управления). */
export function useNoIndex() {
    useEffect(() => {
        setMeta('name', 'robots', 'noindex, nofollow')
    }, [])
}
