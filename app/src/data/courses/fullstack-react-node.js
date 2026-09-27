// Курс: Система на React и Node.js
// Один курс — один файл. Общий список собирается в src/data/courses.js

export default {
    id: 'fullstack-react-node',
    title: 'Система на React и Node.js',
    subtitle: 'Финальный проект курса: фронтенд, бэкенд и база данных, собранные в одну работающую систему.',
    accent: 'lilac',
    section: 'web',
    difficulty: 5,
    disabled: true,
    level: 'Продвинутый',
    duration: '14 уроков',
    image: null,
    video: null,
    chips: ['React', 'Node.js', 'Fullstack', 'Проект'],
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
            content: 'Финальный проект курса: фронтенд, бэкенд и база данных, собранные в одну работающую систему.',
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
                'Проектирование системы: сущности, экраны, API-контракты.',
                'Бэкенд на Node.js и клиент на React в одном репозитории.',
                'Регистрация, вход и личный кабинет пользователя.',
                'Загрузка файлов, фильтры и постраничный вывод.',
                'Сборка, переменные окружения и выкладка на сервер.',
            ],
        },
        {
            block: 'h2',
            content: 'Результат',
        },
        {
            block: 'p',
            content: 'Готовая система, которую не стыдно положить в портфолио.',
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
