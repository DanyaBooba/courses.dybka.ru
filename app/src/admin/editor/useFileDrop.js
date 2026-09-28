import { useRef, useState } from 'react'

import { isFileDrag, pickImages } from '../uploads'

/**
 * Приём картинок перетаскиванием на элемент.
 *
 *   const drop = useFileDrop((files) => …)
 *   <Box {...drop.bind}>{drop.isOver && 'Отпустите'}</Box>
 *
 * dragenter и dragleave приходят и от вложенных элементов, поэтому «файл над
 * зоной» считаем счётчиком, а не флагом — иначе подсветка мигает.
 * `stop` — не отдавать бросок родителю (холсту редактора).
 */
export default function useFileDrop(onFiles, { enabled = true, stop = true } = {}) {
    const [isOver, setIsOver] = useState(false)
    const depth = useRef(0)

    const reset = () => {
        depth.current = 0
        setIsOver(false)
    }

    const bind = enabled
        ? {
            onDragEnter: (event) => {
                if (!isFileDrag(event)) return
                depth.current += 1
                setIsOver(true)
            },
            onDragOver: (event) => {
                if (!isFileDrag(event)) return
                event.preventDefault()
                event.dataTransfer.dropEffect = 'copy'
            },
            onDragLeave: (event) => {
                if (!isFileDrag(event)) return
                depth.current = Math.max(0, depth.current - 1)
                if (depth.current === 0) setIsOver(false)
            },
            onDrop: (event) => {
                if (!isFileDrag(event)) return
                event.preventDefault()
                if (stop) event.stopPropagation()
                reset()
                const files = pickImages(event.dataTransfer.files)
                if (files.length) onFiles(files)
            },
        }
        : {}

    return { isOver: enabled && isOver, bind }
}
