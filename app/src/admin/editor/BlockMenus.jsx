import Dropdown from '@mui/joy/Dropdown'
import MenuButton from '@mui/joy/MenuButton'
import Menu from '@mui/joy/Menu'
import MenuItem from '@mui/joy/MenuItem'
import ListItemDecorator from '@mui/joy/ListItemDecorator'
import ListDivider from '@mui/joy/ListDivider'
import ListSubheader from '@mui/joy/ListSubheader'
import IconButton from '@mui/joy/IconButton'
import Tooltip from '@mui/joy/Tooltip'
import {
    ArrowDownIcon,
    ArrowUpIcon,
    CopyIcon,
    DotsSixVerticalIcon,
    PlusIcon,
    TrashIcon,
} from '@phosphor-icons/react'

import { BLOCK_TYPES, TEXT_TYPES, blockType } from '../blocks'

// Кнопки на полях блока: светлые, проявляются при наведении
const gutterButtonSx = {
    '--IconButton-size': '28px',
    color: 'text.tertiary',
    '&:hover': { color: 'text.primary', bgcolor: 'background.level1' },
}

const menuSx = { minWidth: 220, '--ListItemDecorator-size': '32px', zIndex: 1400 }

/** «+» на полях: выбрать, какой блок вставить следом. */
export function AddBlockMenu({ onPick, label = 'Добавить блок ниже' }) {
    return (
        <Dropdown>
            <Tooltip title={label} placement="top" variant="soft" size="sm">
                <MenuButton
                    slots={{ root: IconButton }}
                    slotProps={{ root: { size: 'sm', variant: 'plain', color: 'neutral', sx: gutterButtonSx, 'aria-label': label } }}
                >
                    <PlusIcon size={18} />
                </MenuButton>
            </Tooltip>
            <Menu placement="bottom-start" size="sm" sx={{ ...menuSx, maxHeight: 420, overflow: 'auto' }}>
                {BLOCK_TYPES.map(({ type, label: title, icon: Icon }) => (
                    <MenuItem key={type} onClick={() => onPick(type)}>
                        <ListItemDecorator>
                            <Icon size={18} />
                        </ListItemDecorator>
                        {title}
                    </MenuItem>
                ))}
            </Menu>
        </Dropdown>
    )
}

/** «⠿» на полях: превратить в другой блок, сдвинуть, дублировать, удалить. */
export function BlockActionsMenu({ block, isFirst, isLast, onConvert, onMove, onDuplicate, onRemove }) {
    const { label, icon: Icon } = blockType(block.block)
    const convertible = TEXT_TYPES.includes(block.block)

    return (
        <Dropdown>
            <Tooltip title={`${label}: действия`} placement="top" variant="soft" size="sm">
                <MenuButton
                    slots={{ root: IconButton }}
                    slotProps={{
                        root: { size: 'sm', variant: 'plain', color: 'neutral', sx: { ...gutterButtonSx, cursor: 'pointer' }, 'aria-label': `${label}: действия` },
                    }}
                >
                    <DotsSixVerticalIcon size={18} weight="bold" />
                </MenuButton>
            </Tooltip>
            <Menu placement="bottom-start" size="sm" sx={menuSx}>
                <ListSubheader sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Icon size={16} />
                    {label}
                </ListSubheader>

                {convertible && (
                    <>
                        {TEXT_TYPES.filter((type) => type !== block.block).map((type) => {
                            const target = blockType(type)
                            return (
                                <MenuItem key={type} onClick={() => onConvert(type)}>
                                    <ListItemDecorator>
                                        <target.icon size={18} />
                                    </ListItemDecorator>
                                    В «{target.label.toLowerCase()}»
                                </MenuItem>
                            )
                        })}
                        <ListDivider />
                    </>
                )}

                <MenuItem disabled={isFirst} onClick={() => onMove(-1)}>
                    <ListItemDecorator>
                        <ArrowUpIcon size={18} />
                    </ListItemDecorator>
                    Выше
                </MenuItem>
                <MenuItem disabled={isLast} onClick={() => onMove(1)}>
                    <ListItemDecorator>
                        <ArrowDownIcon size={18} />
                    </ListItemDecorator>
                    Ниже
                </MenuItem>
                <MenuItem onClick={onDuplicate}>
                    <ListItemDecorator>
                        <CopyIcon size={18} />
                    </ListItemDecorator>
                    Дублировать
                </MenuItem>
                <ListDivider />
                <MenuItem color="danger" onClick={onRemove}>
                    <ListItemDecorator>
                        <TrashIcon size={18} />
                    </ListItemDecorator>
                    Удалить
                </MenuItem>
            </Menu>
        </Dropdown>
    )
}
