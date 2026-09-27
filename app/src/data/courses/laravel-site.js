// Курс: Многостраничный сайт на Laravel
// Один курс — один файл. Общий список собирается в src/data/courses.js

export default {
    id: 'laravel-site',
    title: 'Многостраничный сайт на Laravel',
    subtitle: 'Полноценный сайт на фреймворке: модели, шаблоны, админка и работа с формами.',
    accent: 'rose',
    section: 'web',
    difficulty: 4,
    disabled: true,
    level: 'Нужны основы PHP',
    duration: '12 уроков',
    image: null,
    video: null,
    chips: ['Laravel', 'PHP', 'Blade', 'MVC'],
    github: null,
    author: {
        name: 'Даниил Дыбка',
        email: 'daniil@dybka.ru',
        telegram: 'https://ddybka.t.me',
    },
    certificate: null,
    about: [
        {
            block: 'p',
            content: 'Полноценный сайт на фреймворке: модели, шаблоны, админка и работа с формами.',
        },
        {
            block: 'note',
            content: 'Курс в разработке. Материалы появятся здесь, как только будут готовы.',
        },
        {
            block: 'h2',
            content: 'Чему вы научитесь',
        },
        {
            block: 'ul',
            items: [
                'Установка Laravel и разбор структуры проекта.',
                'Маршруты, контроллеры и шаблоны Blade.',
                'Миграции, модели и связи между таблицами.',
                'Формы, валидация и загрузка файлов.',
                'Админ-панель и права доступа.',
            ],
        },
        {
            block: 'h2',
            content: 'Результат',
        },
        {
            block: 'p',
            content: 'Многостраничный сайт с админкой и собственным контентом.',
        },
    ],
    pages: [
        {
            slug: '1',
            title: '1. Введение',
            short: 'Введение',
            content: [
                {
                    block: 'p',
                    content: 'Текст урока готовится. Загляните в раздел «О курсе» — там уже расписано, что будет внутри.',
                },
            ],
        },
    ],
}
