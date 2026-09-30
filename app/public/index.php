<?php
// SEO для роботов, которые не выполняют JS: мессенджеры, соцсети, иногда Яндекс.
//
// Apache отдаёт этот файл вместо index.html (см. .htaccess). Скрипт берёт
// index.html из сборки, по адресу страницы достаёт курс из API и заменяет блок
// между <!--seo--> и <!--/seo--> тегами этой страницы. Дальше React грузится
// как обычно, и useSeo ставит в <head> те же теги.
//
// Логика — копия src/seo/seo.js. Меняете формат заголовка или описания там —
// поменяйте и здесь.

const SITE_URL = 'https://courses.dybka.ru';
const SITE_NAME = 'courses.dybka.ru';
const SITE_TITLE = 'courses.dybka.ru — бесплатные открытые курсы по программированию';
const SITE_DESCRIPTION = 'Бесплатные открытые курсы по программированию: разработка игр на Unity, вёрстка сайтов и основы кода.';
const DEFAULT_IMAGE = '/img/courses/html-css-first-site/cover.jpg';
const FINAL_SLUG = 'end';

const API_URL = 'https://api.courses.aquarium.org.ru';
const API_TIMEOUT = 2;      // секунды: API не ответил — отдаём теги по умолчанию
const CACHE_TTL = 300;      // секунды: столько живёт ответ API в кэше

// Страницы без данных из API
const STATIC_PAGES = [
    '/privacy' => 'Политика конфиденциальности',
    '/consent' => 'Согласие на обработку персональных данных',
];
// Страницы, которые не надо индексировать
const HIDDEN_PAGES = [
    '#^/login/?$#' => 'Авторизация — courses.dybka.ru',
    '#^/(new|admin)(/.*)?$#' => 'Панель управления — courses.dybka.ru',
];

const FOUNDER = [
    '@type' => 'Person',
    'name' => 'Даниил Дыбка',
    'email' => 'daniil@dybka.ru',
    'sameAs' => ['https://ddybka.t.me'],
];

const ORGANIZATION = [
    '@type' => 'EducationalOrganization',
    '@id' => SITE_URL . '/#organization',
    'name' => SITE_NAME,
    'url' => SITE_URL,
    'logo' => SITE_URL . '/favicon.svg',
    'email' => 'daniil@dybka.ru',
    'founder' => FOUNDER,
    'sameAs' => ['https://ddybka.t.me'],
];

// ── Запросы к API ───────────────────────────────────────────────────────

/** GET к API с кэшем в файле. Возвращает [код ответа, данные]; код 0 — API недоступен. */
function api($path)
{
    $file = sys_get_temp_dir() . '/courses-seo-' . md5($path) . '.json';
    $cached = is_file($file) ? json_decode((string) file_get_contents($file), true) : null;
    if ($cached && time() - filemtime($file) < CACHE_TTL) {
        return [$cached['status'], $cached['data']];
    }

    [$status, $body] = httpGet(API_URL . $path);

    // API недоступен — лучше устаревший ответ, чем никакого
    if ($status === 0 || $status >= 500) {
        return $cached ? [$cached['status'], $cached['data']] : [0, null];
    }

    $data = json_decode((string) $body, true);
    @file_put_contents($file, json_encode(['status' => $status, 'data' => $data]), LOCK_EX);
    return [$status, $data];
}

function httpGet($url)
{
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => API_TIMEOUT,
            CURLOPT_CONNECTTIMEOUT => API_TIMEOUT,
            CURLOPT_HTTPHEADER => ['Accept: application/json'],
        ]);
        $body = curl_exec($ch);
        $status = $body === false ? 0 : (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        return [$status, $body];
    }

    $context = stream_context_create(['http' => ['timeout' => API_TIMEOUT, 'ignore_errors' => true]]);
    $body = @file_get_contents($url, false, $context);
    $status = isset($http_response_header[0]) && preg_match('#\s(\d{3})\s#', $http_response_header[0], $m) ? (int) $m[1] : 0;
    return [$status, $body];
}

// ── Помощники, как в seo.js ─────────────────────────────────────────────

function absoluteUrl($path)
{
    if (!$path) return null;
    if (preg_match('#^https?://#', $path)) return $path;
    return SITE_URL . ($path[0] === '/' ? '' : '/') . $path;
}

/** Текст без inline-markdown: **жирный**, _курсив_, `код`, [ссылка](адрес). */
function plain($text)
{
    $text = preg_replace('/\[([^\]]+)\]\([^)]+\)/u', '$1', (string) $text);
    $text = preg_replace('/\*\*([^*]+)\*\*/u', '$1', $text);
    $text = preg_replace('/_([^_]+)_/u', '$1', $text);
    $text = preg_replace('/`([^`]+)`/u', '$1', $text);
    return trim(preg_replace('/\s+/u', ' ', $text));
}

/** Обрезает текст до длины сниппета, не разрывая слово. */
function clip($text, $max = 160)
{
    if (mb_strlen($text) <= $max) return $text;
    $cut = mb_substr($text, 0, $max - 1);
    $space = mb_strrpos($cut, ' ');
    $cut = $space === false ? '' : mb_substr($cut, 0, $space);
    return preg_replace('/[\s,.;:—-]+$/u', '', $cut) . '…';
}

function describeBlocks($blocks)
{
    $parts = [];
    foreach ($blocks ?: [] as $block) {
        if (($block['block'] ?? '') === 'p' && !empty($block['content'])) $parts[] = plain($block['content']);
        if (count($parts) === 3) break;
    }
    $text = implode(' ', $parts);
    return $text !== '' ? clip($text) : null;
}

function breadcrumbs($items)
{
    $list = [];
    foreach ($items as $index => $item) {
        $list[] = ['@type' => 'ListItem', 'position' => $index + 1, 'name' => $item[0], 'item' => absoluteUrl($item[1])];
    }
    return ['@type' => 'BreadcrumbList', 'itemListElement' => $list];
}

function graph(...$nodes)
{
    return ['@context' => 'https://schema.org', '@graph' => $nodes];
}

// ── Страницы, как в seo.js ──────────────────────────────────────────────

function homeSeo($courses)
{
    $items = [];
    foreach ($courses ?: [] as $course) {
        if (empty($course['disabled'])) {
            $items[] = ['@type' => 'ListItem', 'position' => count($items) + 1, 'url' => absoluteUrl('/course/' . $course['id'])];
        }
    }

    $nodes = [
        ORGANIZATION,
        [
            '@type' => 'WebSite',
            '@id' => SITE_URL . '/#website',
            'name' => SITE_NAME,
            'url' => SITE_URL,
            'inLanguage' => 'ru',
            'publisher' => ['@id' => ORGANIZATION['@id']],
        ],
    ];
    if ($items) $nodes[] = ['@type' => 'ItemList', 'itemListElement' => $items];

    return [
        'title' => SITE_TITLE,
        'description' => SITE_DESCRIPTION,
        'url' => absoluteUrl('/'),
        'image' => absoluteUrl(DEFAULT_IMAGE),
        'type' => 'website',
        'jsonLd' => graph(...$nodes),
    ];
}

function courseSeo($course)
{
    $path = '/course/' . $course['id'];
    $description = clip(plain($course['subtitle'] ?? '')) ?: SITE_DESCRIPTION;
    $image = absoluteUrl($course['image'] ?? null) ?? absoluteUrl(DEFAULT_IMAGE);
    $author = FOUNDER;
    if (!empty($course['author']['name'])) {
        $author = ['@type' => 'Person', 'name' => $course['author']['name']];
        if (!empty($course['author']['telegram'])) $author['sameAs'] = [$course['author']['telegram']];
    }

    $node = [
        '@type' => 'Course',
        '@id' => absoluteUrl($path) . '#course',
        'name' => $course['title'],
        'description' => $description,
        'url' => absoluteUrl($path),
        'image' => $image,
        'inLanguage' => 'ru',
        'isAccessibleForFree' => true,
        'provider' => ORGANIZATION,
        'author' => $author,
    ];
    if (!empty($course['level'])) $node['coursePrerequisites'] = $course['level'];
    if (!empty($course['chips'])) $node['teaches'] = $course['chips'];
    if (!empty($course['updatedAt'])) $node['dateModified'] = $course['updatedAt'];
    $node['offers'] = ['@type' => 'Offer', 'category' => 'Free', 'price' => 0, 'priceCurrency' => 'RUB'];
    $node['hasCourseInstance'] = ['@type' => 'CourseInstance', 'courseMode' => 'Online'];

    return [
        'title' => $course['title'] . ' — ' . SITE_NAME,
        'description' => $description,
        'url' => absoluteUrl($path),
        'image' => $image,
        'type' => 'website',
        'robots' => !empty($course['disabled']) ? 'noindex' : null,
        'jsonLd' => graph($node, breadcrumbs([['Курсы', '/'], [$course['title'], $path]])),
    ];
}

function lessonSeo($course, $page, $position)
{
    $coursePath = '/course/' . $course['id'];
    $path = $coursePath . '/' . $page['slug'];
    // С номером, как заголовок на странице урока: «2. Как устроен сайт»
    $name = ($page['title'] ?? '') ?: (($page['short'] ?? '') ?: 'Урок');
    $title = $position > 0 ? $position . '. ' . $name : $name;
    $description = describeBlocks($page['content'] ?? []) ?? (clip(plain($course['subtitle'] ?? '')) ?: SITE_DESCRIPTION);

    $firstImage = null;
    foreach ($page['content'] ?? [] as $block) {
        if (($block['block'] ?? '') === 'img' && !empty($block['src'])) {
            $firstImage = $block['src'];
            break;
        }
    }
    $image = absoluteUrl($firstImage) ?? absoluteUrl($course['image'] ?? null) ?? absoluteUrl(DEFAULT_IMAGE);

    $node = [
        '@type' => 'LearningResource',
        'name' => $title,
        'description' => $description,
        'url' => absoluteUrl($path),
        'image' => $image,
        'inLanguage' => 'ru',
        'learningResourceType' => 'Урок',
        'isAccessibleForFree' => true,
    ];
    if ($position > 0) $node['position'] = $position;
    $node['isPartOf'] = ['@type' => 'Course', '@id' => absoluteUrl($coursePath) . '#course', 'name' => $course['title']];
    $node['publisher'] = ORGANIZATION;

    return [
        'title' => $title . ' — ' . $course['title'],
        'description' => $description,
        'url' => absoluteUrl($path),
        'image' => $image,
        'type' => 'article',
        'robots' => !empty($course['disabled']) ? 'noindex' : null,
        'jsonLd' => graph($node, breadcrumbs([['Курсы', '/'], [$course['title'], $coursePath], [$title, $path]])),
    ];
}

function pageSeo($title, $path)
{
    return [
        'title' => $title . ' — ' . SITE_NAME,
        'description' => SITE_DESCRIPTION,
        'url' => absoluteUrl($path),
        'image' => absoluteUrl(DEFAULT_IMAGE),
        'type' => 'website',
    ];
}

function hiddenSeo($title)
{
    return ['title' => $title, 'description' => SITE_DESCRIPTION, 'robots' => 'noindex, nofollow'];
}

// ── Какая это страница ──────────────────────────────────────────────────

/** SEO по адресу. Возвращает [код ответа, seo]; seo null — оставить теги по умолчанию. */
function resolve($path)
{
    $notFound = [404, hiddenSeo('Страница не найдена — ' . SITE_NAME)];

    if ($path === '/') {
        [, $data] = api('/courses');
        return [200, homeSeo($data['courses'] ?? [])];
    }

    if (isset(STATIC_PAGES[$path])) return [200, pageSeo(STATIC_PAGES[$path], $path)];

    foreach (HIDDEN_PAGES as $pattern => $title) {
        if (preg_match($pattern, $path)) return [200, hiddenSeo($title)];
    }

    if (!preg_match('#^/course/([a-z0-9-]+)(?:/([a-z0-9-]+))?/?$#', $path, $m)) return $notFound;

    [$status, $data] = api('/courses/' . rawurlencode($m[1]));

    // API недоступен — теги по умолчанию, а страницу React покажет сам
    if ($status === 0) return [200, null];
    if ($status === 404) return $notFound;

    // Закрытый курс: название берём из каталога, как плашка «Ведётся работа»
    if ($status === 403) {
        [, $catalog] = api('/courses');
        foreach ($catalog['courses'] ?? [] as $course) {
            if ($course['id'] === $m[1]) return [200, hiddenSeo($course['title'] . ' — ведётся работа')];
        }
        return [200, hiddenSeo('Ведётся работа — ' . SITE_NAME)];
    }

    $course = $data['course'] ?? null;
    if (!$course) return [200, null];
    if (empty($m[2])) return [200, courseSeo($course)];

    foreach ($course['pages'] ?? [] as $index => $page) {
        if ($page['slug'] === $m[2]) {
            return [200, lessonSeo($course, $page, $page['slug'] === FINAL_SLUG ? 0 : $index + 1)];
        }
    }
    return $notFound;
}

// ── Теги ────────────────────────────────────────────────────────────────

function renderTags($seo)
{
    $e = function ($value) {
        return htmlspecialchars((string) $value, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    };
    $meta = function ($attr, $key, $content) use ($e) {
        return $content ? "<meta $attr=\"$key\" content=\"{$e($content)}\" />" : null;
    };
    $image = $seo['image'] ?? null;

    $tags = [
        $meta('name', 'description', $seo['description'] ?? null),
        $meta('name', 'robots', $seo['robots'] ?? null),
        !empty($seo['url']) ? "<link rel=\"canonical\" href=\"{$e($seo['url'])}\" />" : null,
        $meta('property', 'og:site_name', SITE_NAME),
        $meta('property', 'og:locale', 'ru_RU'),
        $meta('property', 'og:type', $seo['type'] ?? 'website'),
        $meta('property', 'og:title', $seo['title']),
        $meta('property', 'og:description', $seo['description'] ?? null),
        $meta('property', 'og:url', $seo['url'] ?? null),
        $meta('property', 'og:image', $image),
        $meta('name', 'twitter:card', $image ? 'summary_large_image' : 'summary'),
        $meta('name', 'twitter:title', $seo['title']),
        $meta('name', 'twitter:description', $seo['description'] ?? null),
        $meta('name', 'twitter:image', $image),
        "<title>{$e($seo['title'])}</title>",
    ];

    if (!empty($seo['jsonLd'])) {
        // JSON_HEX_TAG: текст урока не сможет закрыть </script>
        $json = json_encode($seo['jsonLd'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_AMP);
        $tags[] = "<script type=\"application/ld+json\" id=\"seo-jsonld\">$json</script>";
    }

    return implode("\n    ", array_filter($tags));
}

// ── Ответ ───────────────────────────────────────────────────────────────

$html = file_get_contents(__DIR__ . '/index.html');
$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';

[$status, $seo] = resolve($path);

if ($seo) {
    $html = preg_replace_callback('#<!--seo-->.*?<!--/seo-->#s', function () use ($seo) {
        return "<!--seo-->\n    " . renderTags($seo) . "\n    <!--/seo-->";
    }, $html, 1);
}

http_response_code($status);
header('Content-Type: text/html; charset=utf-8');
echo $html;
