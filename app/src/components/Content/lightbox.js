// Просмотр картинок на весь экран.
//
// Fancybox подключается один раз на всё приложение и сам ловит клики по
// ссылкам с атрибутом `data-fancybox`. Настроек минимум: в панели остаются
// только лупа и крестик, всё остальное (счётчик, миниатюры, стрелки,
// слайдшоу, скачивание) выключено.

import { Fancybox } from '@fancyapps/ui'
import '@fancyapps/ui/dist/fancybox/fancybox.css'

const options = {
    Carousel: {
        Arrows: false,
        Thumbs: false,
        Toolbar: {
            display: {
                left: [],
                middle: [],
                // toggleFull — это и есть «лупа»: приближает картинку к 1:1
                right: ['toggleFull', 'close'],
            },
        },
    },
}

let bound = false

/** Подключает Fancybox к ссылкам `[data-fancybox]`. Повторные вызовы игнорируются. */
export default function setupLightbox() {
    if (bound) return
    bound = true
    Fancybox.bind('[data-fancybox]', options)
}
