import { useEffect, useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useColorScheme } from '@mui/joy/styles'
import Box from '@mui/joy/Box'

import { getAccent, getInk } from '../../theme/accents'

/**
 * Разовый салют из бумажных квадратиков.
 *
 * Не библиотека и не canvas: набор абсолютно позиционированных полосок, которые
 * framer-motion разбрасывает из одной точки. Это взрыв, а не фонтан: бумажки
 * вылетают одновременно и во все стороны, каждая под своим углом и со своей
 * силой, а потом всех одинаково уводит вниз.
 *
 * Траектория собрана так, чтобы нигде не было излома: по горизонтали одно
 * непрерывное движение с сильным затуханием (это сопротивление воздуха), по
 * вертикали — подъём, переходящий в спуск через верхнюю точку, где скорость
 * гасится до нуля с обеих сторон. В конце все гаснут. Салют отыгрывает один раз
 * и сообщает об этом через onDone, чтобы родитель его снял.
 *
 * Вставлять внутрь контейнера с position: relative.
 */

// Общая длительность залпа. Салют намеренно медленный: он не спецэффект, а
// награда — человек должен успеть его заметить и рассмотреть. Это единственная
// ручка скорости, всё остальное считается от неё.
const DURATION = 2.1

// Доля времени до верхней точки. Дальше только спуск, поэтому падение занимает
// почти весь залп, а сам разлёт — короткая вспышка в начале.
const APEX = 0.26

// Краски салюта — те же, что у курсов в каталоге, так что разноцветно, но в
// палитре сайта. В тёмной теме берутся осветлённые варианты (getInk).
const PALETTE = ['mint', 'lilac', 'peach', 'sky', 'rose', 'amber', 'teal', 'indigo']

// Мелкий рандом для формы залпа. Вынесен из компонента: внутри рендера
// Math.random() звать нельзя, а результат всё равно кэшируется в useMemo.
/** Случайное число в диапазоне — чтобы каждый залп был чуть другим. */
const between = (min, max) => min + Math.random() * (max - min)

/** Выпало ли событие с вероятностью p. */
const chance = (p) => Math.random() < p

/** Случайное направление: 1 или -1. */
const sign = () => (chance(0.5) ? 1 : -1)

/** Случайный элемент списка. */
const pick = (list) => list[Math.floor(Math.random() * list.length)]

/**
 * Настройки анимации одного свойства бумажки.
 *
 * Важно: длительность и задержку приходится повторять для каждого свойства.
 * framer-motion, встретив в transition ключ с именем свойства, берёт только его
 * содержимое и общие настройки рядом уже не подмешивает — без `duration` внутри
 * свойство уезжает на стандартные 0.3 с, и весь долгий залп схлопывается в
 * мгновенный хлопок.
 */
const track = (piece, options) => ({
    duration: piece.duration,
    delay: piece.delay,
    ...options,
})

export default function Confetti({
    count = 60,
    lead,
    colors,
    // Точка взрыва внутри родителя: origin — по горизонтали, launch — по
    // вертикали. Проценты считаются от размеров родительского блока.
    origin = '50%',
    launch = '0',
    onDone,
}) {
    const { mode, systemMode } = useColorScheme()
    const resolved = mode === 'system' ? systemMode || 'light' : mode || 'light'
    const reduceMotion = useReducedMotion()

    // Палитра: краска курса идёт первой и попадается чаще остальных, дальше
    // цвета каталога. Можно передать готовый список через `colors`.
    const paint = useMemo(() => {
        if (colors?.length) return colors
        const rest = PALETTE.map((name) => getInk(getAccent(name), resolved))
        return lead ? [lead, lead, ...rest] : rest
    }, [colors, lead, resolved])

    // Форму залпа считаем один раз: иначе каждый ре-рендер сдвигал бы бумажки.
    const pieces = useMemo(
        () =>
            Array.from({ length: count }, (_, index) => {
                // Взрыв: угол по всей окружности, сила у каждой бумажки своя.
                // Вниз летят тоже — иначе это не взрыв, а фонтан.
                const angle = between(0, Math.PI * 2)
                const force = between(70, 300)
                const flat = chance(0.35)

                return {
                    id: index,
                    color: pick(paint),
                    // Часть бумажек — вытянутые полоски, часть почти квадраты
                    width: flat ? between(7, 12) : between(5, 8),
                    height: flat ? between(4, 7) : between(10, 18),
                    // Куда унесло взрывом. По вертикали разлёт чуть слабее:
                    // вверх бумажку сразу начинает тормозить тяжесть.
                    burstX: Math.cos(angle) * force,
                    burstY: Math.sin(angle) * force * 0.8,
                    // Остаточный снос в сторону, пока бумажка падает
                    drift: between(-70, 70),
                    fall: between(300, 520),
                    spin: between(360, 900) * sign(),
                    // Трепыхание: бумажка поворачивается к нам то плашмя, то ребром
                    flutter: between(0.25, 0.6),
                    // Взрыв — событие мгновенное, разброс старта почти неощутим
                    delay: between(0, DURATION * 0.015),
                    duration: DURATION * between(0.82, 1),
                }
            }),
        [count, paint],
    )

    // Уважаем системную настройку: без анимаций салюта нет, но родитель должен
    // об этом узнать, иначе он будет вечно держать несуществующий залп.
    useEffect(() => {
        if (reduceMotion) onDone?.()
    }, [reduceMotion, onDone])

    if (reduceMotion) return null

    return (
        <Box
            aria-hidden
            sx={{
                position: 'absolute',
                left: origin,
                top: launch,
                width: 0,
                height: 0,
                pointerEvents: 'none',
                zIndex: 2,
                overflow: 'visible',
            }}
        >
            {pieces.map((piece) => (
                <motion.span
                    key={piece.id}
                    initial={{ x: 0, y: 0, rotate: 0, scale: 0.4, opacity: 1 }}
                    animate={{
                        // Одна цель, без промежуточных кадров: излому взяться негде
                        x: piece.burstX + piece.drift,
                        // Подъём и спуск через общую верхнюю точку
                        y: [0, piece.burstY, piece.burstY + piece.fall],
                        rotate: piece.spin,
                        // Вспышка: в момент взрыва бумажки как будто раскрываются
                        scale: [0.4, 1.12, 1, 1],
                        scaleX: [1, piece.flutter, 1, piece.flutter, 1],
                        opacity: [1, 1, 0],
                    }}
                    transition={{
                        duration: piece.duration,
                        delay: piece.delay,
                        // circOut: почти вся скорость уходит в первые мгновения,
                        // дальше бумажку только сносит — это и есть воздух.
                        x: track(piece, { ease: 'circOut' }),
                        // Вверх — с замедлением к верхней точке, вниз — с плавным
                        // разгоном и таким же плавным выходом. В самой точке
                        // скорость нулевая с обеих сторон, поэтому перелома нет.
                        y: track(piece, {
                            times: [0, APEX, 1],
                            ease: ['easeOut', 'easeInOut'],
                        }),
                        // Кувырок тоже затухает, а не крутится равномерно
                        rotate: track(piece, { ease: 'easeOut' }),
                        scale: track(piece, { times: [0, 0.05, 0.14, 1], ease: 'easeOut' }),
                        scaleX: track(piece, { ease: 'easeInOut' }),
                        // Гаснут только в самом конце, уже на лету вниз
                        opacity: track(piece, { times: [0, 0.78, 1], ease: 'easeIn' }),
                    }}
                    style={{
                        position: 'absolute',
                        display: 'block',
                        width: piece.width,
                        height: piece.height,
                        backgroundColor: piece.color,
                    }}
                />
            ))}

            {/* Невидимый таймер: гарантированно доигрывает дольше всех бумажек */}
            <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.01 }}
                transition={{ duration: DURATION * 1.1 }}
                onAnimationComplete={onDone}
                style={{ position: 'absolute', width: 1, height: 1 }}
            />
        </Box>
    )
}
