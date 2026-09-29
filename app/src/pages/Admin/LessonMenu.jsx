import Dropdown from '@mui/joy/Dropdown'
import MenuButton from '@mui/joy/MenuButton'
import Menu from '@mui/joy/Menu'
import MenuItem from '@mui/joy/MenuItem'
import ListDivider from '@mui/joy/ListDivider'
import ListItemDecorator from '@mui/joy/ListItemDecorator'
import IconButton from '@mui/joy/IconButton'
import { ArrowDownIcon, ArrowUpIcon, DotsThreeVerticalIcon, TrashIcon } from '@phosphor-icons/react'

/**
 * «⋮» у урока в левом меню: сдвинуть выше или ниже и удалить.
 * `onMove(step)` — −1 выше, 1 ниже; без `canUp`/`canDown` пункт неактивен.
 */
export default function LessonMenu({ title, canUp, canDown, onMove, onRemove, className }) {
    return (
        <Dropdown>
            <MenuButton
                slots={{ root: IconButton }}
                slotProps={{
                    root: {
                        size: 'sm',
                        variant: 'plain',
                        color: 'neutral',
                        className,
                        'aria-label': `Урок «${title}»: действия`,
                        sx: { '--IconButton-size': '26px', color: 'text.tertiary', '&:hover': { color: 'text.primary' } },
                    },
                }}
            >
                <DotsThreeVerticalIcon size={16} weight="bold" />
            </MenuButton>
            <Menu placement="bottom-end" size="sm" sx={{ minWidth: 180, '--ListItemDecorator-size': '28px', zIndex: 1400 }}>
                <MenuItem disabled={!canUp} onClick={() => onMove(-1)}>
                    <ListItemDecorator>
                        <ArrowUpIcon size={16} />
                    </ListItemDecorator>
                    Выше
                </MenuItem>
                <MenuItem disabled={!canDown} onClick={() => onMove(1)}>
                    <ListItemDecorator>
                        <ArrowDownIcon size={16} />
                    </ListItemDecorator>
                    Ниже
                </MenuItem>
                <ListDivider />
                <MenuItem color="danger" onClick={onRemove}>
                    <ListItemDecorator sx={{ color: 'inherit' }}>
                        <TrashIcon size={16} />
                    </ListItemDecorator>
                    Удалить урок
                </MenuItem>
            </Menu>
        </Dropdown>
    )
}
