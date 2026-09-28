import Box from '@mui/joy/Box'
import Button from '@mui/joy/Button'
import Sheet from '@mui/joy/Sheet'
import Table from '@mui/joy/Table'
import { MinusIcon, PlusIcon } from '@phosphor-icons/react'

import AutoTextarea from './AutoTextarea'
import { tableSheetSx, tableSx } from '../../components/Content/blockStyles'

/** Таблица правится по ячейкам прямо в своей вёрстке; под ней — строки и столбцы. */
export default function TableEditor({ block, onChange, focus }) {
    const head = block.head ?? []
    const rows = block.rows ?? []
    const columns = Math.max(head.length, ...rows.map((row) => row.length), 1)

    const setHead = (index, value) => onChange({ ...block, head: fill(head, columns).map((cell, i) => (i === index ? value : cell)) })

    const setCell = (rowIndex, index, value) =>
        onChange({
            ...block,
            rows: rows.map((row, r) => (r === rowIndex ? fill(row, columns).map((cell, i) => (i === index ? value : cell)) : row)),
        })

    const addRow = () => onChange({ ...block, rows: [...rows, Array(columns).fill('')] })
    const removeRow = () => onChange({ ...block, rows: rows.slice(0, -1) })
    const addColumn = () =>
        onChange({ ...block, head: [...fill(head, columns), ''], rows: rows.map((row) => [...fill(row, columns), '']) })
    const removeColumn = () =>
        onChange({
            ...block,
            head: fill(head, columns).slice(0, -1),
            rows: rows.map((row) => fill(row, columns).slice(0, -1)),
        })

    return (
        <Box>
            <Sheet variant="outlined" sx={tableSheetSx}>
                <Table sx={tableSx}>
                    <thead>
                        <tr>
                            {fill(head, columns).map((cell, index) => (
                                <th key={index} style={{ fontWeight: 700 }}>
                                    <AutoTextarea
                                        value={cell}
                                        onChange={(value) => setHead(index, value)}
                                        focus={index === 0 ? focus : undefined}
                                        placeholder={`Столбец ${index + 1}`}
                                        aria-label={`Заголовок столбца ${index + 1}`}
                                    />
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {fill(row, columns).map((cell, index) => (
                                    <td key={index}>
                                        <AutoTextarea
                                            value={cell}
                                            onChange={(value) => setCell(rowIndex, index, value)}
                                            aria-label={`Строка ${rowIndex + 1}, столбец ${index + 1}`}
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Sheet>

            <Box sx={{ mt: -1.5, mb: 3, display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                <Button size="sm" variant="outlined" color="neutral" startDecorator={<PlusIcon />} onClick={addRow}>
                    Строка
                </Button>
                <Button size="sm" variant="outlined" color="neutral" startDecorator={<PlusIcon />} onClick={addColumn}>
                    Столбец
                </Button>
                <Button
                    size="sm"
                    variant="plain"
                    color="neutral"
                    startDecorator={<MinusIcon />}
                    onClick={removeRow}
                    disabled={rows.length === 0}
                >
                    Строка
                </Button>
                <Button
                    size="sm"
                    variant="plain"
                    color="neutral"
                    startDecorator={<MinusIcon />}
                    onClick={removeColumn}
                    disabled={columns <= 1}
                >
                    Столбец
                </Button>
            </Box>
        </Box>
    )
}

// Строка таблицы нужной ширины: недостающие ячейки — пустые
function fill(cells, length) {
    return Array.from({ length }, (_, index) => cells[index] ?? '')
}
