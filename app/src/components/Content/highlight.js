// Подсветка кода в блоках уроков.
//
// Prism работает без DOM: ему отдаётся строка и грамматика, обратно приходит
// готовая html-разметка с классами `token`. Раскраска задаётся не темой Prism,
// а палитрой сайта — см. `tokenStyles` ниже и группу `code` в themeVariant.js.

import Prism from 'prismjs'

// Языки. `markup`, `css`, `clike` и `javascript` Prism загружает сам,
// остальное подключаем руками — в том числе C# для уроков по Unity.
import 'prismjs/components/prism-csharp'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-scss'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-markup-templating'
import 'prismjs/components/prism-php'
import 'prismjs/components/prism-sql'
import 'prismjs/components/prism-yaml'
import 'prismjs/components/prism-ini'
import 'prismjs/components/prism-diff'

// Как язык называется в данных курса → грамматика Prism.
const aliases = {
    'c#': 'csharp',
    cs: 'csharp',
    csharp: 'csharp',
    unityscript: 'csharp',
    html: 'markup',
    xml: 'markup',
    svg: 'markup',
    vue: 'markup',
    blade: 'markup',
    css: 'css',
    scss: 'scss',
    sass: 'scss',
    js: 'javascript',
    javascript: 'javascript',
    jsx: 'jsx',
    ts: 'typescript',
    typescript: 'typescript',
    tsx: 'tsx',
    json: 'json',
    php: 'php',
    sql: 'sql',
    yaml: 'yaml',
    yml: 'yaml',
    ini: 'ini',
    env: 'ini',
    diff: 'diff',
    bash: 'bash',
    sh: 'bash',
    shell: 'bash',
    zsh: 'bash',
    console: 'bash',
    terminal: 'bash',
}

/** Имя грамматики Prism для подписи языка из данных курса (или null). */
export function resolveLanguage(language) {
    if (!language) return null
    const key = String(language).trim().toLowerCase()
    const name = aliases[key] ?? key
    return Prism.languages[name] ? name : null
}

/**
 * Разметка с токенами для строки кода. Если язык неизвестен — возвращаем null,
 * и блок рисуется обычным текстом.
 */
export function highlight(code, language) {
    const name = resolveLanguage(language)
    if (!name) return null
    try {
        return Prism.highlight(code, Prism.languages[name], name)
    } catch {
        return null
    }
}

/**
 * Цвета токенов в терминах палитры темы: подставляются в `sx` блока кода,
 * поэтому автоматически переключаются вместе со светлой и тёмной темой.
 */
export const tokenStyles = {
    '& .token.comment, & .token.prolog, & .token.doctype, & .token.cdata': {
        color: 'code.comment',
        fontStyle: 'italic',
    },
    '& .token.punctuation, & .token.operator': { color: 'code.punctuation' },
    '& .token.keyword, & .token.rule, & .token.important, & .token.atrule': {
        color: 'code.keyword',
    },
    '& .token.string, & .token.char, & .token.attr-value, & .token.regex, & .token.url': {
        color: 'code.string',
    },
    '& .token.number, & .token.boolean, & .token.constant, & .token.symbol, & .token.unit': {
        color: 'code.number',
    },
    '& .token.function, & .token.method, & .token.selector, & .token.property': {
        color: 'code.fn',
    },
    '& .token.tag, & .token.namespace, & .token.deleted-sign': { color: 'code.tag' },
    // Угловые скобки и слеши тега красим краской тега, а кавычки значения —
    // краской строки, иначе атрибут выглядит разорванным
    '& .token.tag > .token.punctuation, & .token.tag > .token.tag > .token.punctuation': {
        color: 'code.tag',
        opacity: 0.8,
    },
    '& .token.attr-value .token.punctuation': { color: 'code.string' },
    '& .token.attr-value .token.attr-equals': { color: 'code.punctuation' },
    '& .token.attr-name, & .token.property-access': { color: 'code.attrName' },
    '& .token.variable, & .token.parameter, & .token.interpolation': { color: 'code.variable' },
    '& .token.builtin, & .token.entity': { color: 'code.builtin' },
    '& .token.class-name, & .token.type-declaration, & .token.generic-method': {
        color: 'code.classname',
    },
    '& .token.deleted': { color: 'code.deleted' },
    '& .token.inserted': { color: 'code.inserted' },
    '& .token.bold': { fontWeight: 700 },
    '& .token.italic': { fontStyle: 'italic' },
}
