// Урок текстом — для меню «Скопировать»: Markdown или HTML-разметка.
// Блоки те же, что рисует ContentBlocks; схема блоков — в src/data/courses.js.
// Ссылки и картинки с адресом от корня сайта («/course/…») становятся
// полными: скопированный текст открывается и за пределами сайта.

const INLINE = /(\*\*[^*]+\*\*|_[^_]+_|`[^`]+`|\[[^\]]+\]\([^)]+\))/g

function absolute(url) {
    if (!url || !url.startsWith('/') || url.startsWith('//')) return url
    return `${window.location.origin}${url}`
}

// ── Markdown ─────────────────────────────────────────────────────────────
// Строчная разметка в данных уже markdown — остаётся только поправить адреса.

function mdInline(text = '') {
    return text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) => `[${label}](${absolute(href)})`)
}

function mdList(items, ordered, depth = 0) {
    const indent = '   '.repeat(depth)
    return items.flatMap((item, index) => {
        const marker = ordered ? `${index + 1}.` : '-'
        if (typeof item === 'string') return [`${indent}${marker} ${mdInline(item)}`]
        return [`${indent}${marker} ${mdInline(item.text)}`, ...mdList(item.items ?? [], ordered, depth + 1)]
    })
}

function mdCell(text = '') {
    return mdInline(text).replace(/\|/g, '\\|').replace(/\n/g, ' ')
}

function mdQuote(text) {
    return text.split('\n').map((line) => `> ${line}`.trimEnd()).join('\n')
}

const markdown = {
    p: (block) => mdInline(block.content),
    h2: (block) => `## ${mdInline(block.content)}`,
    h3: (block) => `### ${mdInline(block.content)}`,
    quote: (block) => mdQuote(mdInline(block.content)),
    note: (block) => mdQuote(`**Заметка.** ${mdInline(block.content)}`),
    img: (block) => {
        if (!block.src) return null
        const image = `![${block.alt || ''}](${absolute(block.src)})`
        return block.caption ? `${image}\n\n_${mdInline(block.caption)}_` : image
    },
    code: (block) => {
        // Внутри кода могут быть свои ```: ограда должна быть длиннее
        const longest = Math.max(2, ...(block.content.match(/`+/g) ?? []).map((run) => run.length))
        const fence = '`'.repeat(longest + 1)
        return `${fence}${(block.language || '').toLowerCase()}\n${block.content}\n${fence}`
    },
    ul: (block) => mdList(block.items ?? [], false).join('\n'),
    ol: (block) => mdList(block.items ?? [], true).join('\n'),
    table: (block) => {
        const head = block.head ?? []
        return [
            `| ${head.map(mdCell).join(' | ')} |`,
            `| ${head.map(() => '---').join(' | ')} |`,
            ...(block.rows ?? []).map((row) => `| ${row.map(mdCell).join(' | ')} |`),
        ].join('\n')
    },
    checklist: (block) =>
        [block.title && `### ${mdInline(block.title)}`, (block.items ?? []).map((item) => `- [ ] ${mdInline(item)}`).join('\n')]
            .filter(Boolean)
            .join('\n\n'),
    courses: (block) =>
        [
            block.title && `## ${mdInline(block.title)}`,
            (block.items ?? []).map((id) => `- [${id}](${absolute(`/course/${id}`)})`).join('\n'),
        ]
            .filter(Boolean)
            .join('\n\n'),
    quiz: ({ quiz }) => {
        if (!quiz) return null
        const questions = (quiz.questions ?? []).map((question, index) =>
            [
                `${index + 1}. ${mdInline(question.question)}`,
                ...(question.options ?? []).map(
                    (option, optionIndex) => `   - [${question.correct?.includes(optionIndex) ? 'x' : ' '}] ${mdInline(option)}`,
                ),
                question.hint && `\n   _Подсказка: ${mdInline(question.hint)}_`,
            ]
                .filter(Boolean)
                .join('\n'),
        )
        return [quiz.title && `## ${mdInline(quiz.title)}`, quiz.intro && mdInline(quiz.intro), ...questions]
            .filter(Boolean)
            .join('\n\n')
    },
}

/** Урок в Markdown: заголовок и блоки через пустую строку. */
export function lessonToMarkdown(page) {
    const blocks = (page.content ?? []).map((block) => markdown[block.block]?.(block)).filter(Boolean)
    return [`# ${page.title}`, ...blocks].join('\n\n') + '\n'
}

// ── HTML ─────────────────────────────────────────────────────────────────

function escape(text = '') {
    return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

// Тот же разбор, что в InlineText, только в строку
function htmlInline(text = '') {
    return text
        .split(INLINE)
        .filter((part) => part !== '')
        .map((part) => {
            if (part.startsWith('**') && part.endsWith('**')) return `<strong>${escape(part.slice(2, -2))}</strong>`
            if (part.startsWith('_') && part.endsWith('_') && part.length > 2) return `<em>${escape(part.slice(1, -1))}</em>`
            if (part.startsWith('`') && part.endsWith('`') && part.length > 2) return `<code>${escape(part.slice(1, -1))}</code>`
            const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
            if (link) return `<a href="${escape(absolute(link[2]))}">${escape(link[1])}</a>`
            return escape(part)
        })
        .join('')
}

function htmlList(items, ordered) {
    const tag = ordered ? 'ol' : 'ul'
    const lis = items.map((item) =>
        typeof item === 'string'
            ? `<li>${htmlInline(item)}</li>`
            : `<li>${htmlInline(item.text)}${htmlList(item.items ?? [], ordered)}</li>`,
    )
    return `<${tag}>${lis.join('')}</${tag}>`
}

const html = {
    p: (block) => `<p>${htmlInline(block.content)}</p>`,
    h2: (block) => `<h2>${htmlInline(block.content)}</h2>`,
    h3: (block) => `<h3>${htmlInline(block.content)}</h3>`,
    quote: (block) => `<blockquote><p>${htmlInline(block.content)}</p></blockquote>`,
    note: (block) => `<aside><p><strong>Заметка.</strong> ${htmlInline(block.content)}</p></aside>`,
    img: (block) => {
        if (!block.src) return null
        const image = `<img src="${escape(absolute(block.src))}" alt="${escape(block.alt || '')}">`
        return `<figure>${image}${block.caption ? `<figcaption>${htmlInline(block.caption)}</figcaption>` : ''}</figure>`
    },
    code: (block) => {
        const language = block.language ? ` class="language-${escape(block.language.toLowerCase())}"` : ''
        return `<pre><code${language}>${escape(block.content)}</code></pre>`
    },
    ul: (block) => htmlList(block.items ?? [], false),
    ol: (block) => htmlList(block.items ?? [], true),
    table: (block) =>
        [
            '<table>',
            `<thead><tr>${(block.head ?? []).map((cell) => `<th>${htmlInline(cell)}</th>`).join('')}</tr></thead>`,
            `<tbody>${(block.rows ?? [])
                .map((row) => `<tr>${row.map((cell) => `<td>${htmlInline(cell)}</td>`).join('')}</tr>`)
                .join('')}</tbody>`,
            '</table>',
        ].join(''),
    checklist: (block) =>
        (block.title ? `<h3>${htmlInline(block.title)}</h3>` : '') +
        `<ul>${(block.items ?? []).map((item) => `<li><input type="checkbox" disabled> ${htmlInline(item)}</li>`).join('')}</ul>`,
    courses: (block) =>
        (block.title ? `<h2>${htmlInline(block.title)}</h2>` : '') +
        `<ul>${(block.items ?? [])
            .map((id) => `<li><a href="${escape(absolute(`/course/${id}`))}">${escape(id)}</a></li>`)
            .join('')}</ul>`,
    quiz: ({ quiz }) => {
        if (!quiz) return null
        const questions = (quiz.questions ?? []).map((question) => {
            const options = (question.options ?? [])
                .map((option, index) =>
                    question.correct?.includes(index) ? `<li><strong>${htmlInline(option)}</strong> ✓</li>` : `<li>${htmlInline(option)}</li>`,
                )
                .join('')
            const hint = question.hint ? `<p><em>Подсказка: ${htmlInline(question.hint)}</em></p>` : ''
            return `<li><p>${htmlInline(question.question)}</p><ul>${options}</ul>${hint}</li>`
        })
        return [
            '<section>',
            quiz.title ? `<h2>${htmlInline(quiz.title)}</h2>` : '',
            quiz.intro ? `<p>${htmlInline(quiz.intro)}</p>` : '',
            `<ol>${questions.join('')}</ol>`,
            '</section>',
        ].join('')
    },
}

/** Урок в HTML: `<article>` с заголовком и блоками, по блоку на строку. */
export function lessonToHtml(page) {
    const blocks = (page.content ?? []).map((block) => html[block.block]?.(block)).filter(Boolean)
    return ['<article>', `<h1>${escape(page.title)}</h1>`, ...blocks, '</article>'].join('\n') + '\n'
}
