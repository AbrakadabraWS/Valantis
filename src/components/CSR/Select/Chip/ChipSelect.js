

'use client'
import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, OutlinedInput, InputLabel, MenuItem, FormControl, Select, Chip } from '@mui/material';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

const getStyles = (itemText, menuItems, value, theme) => {
    return {
        fontWeight:
            value.indexOf(menuItems[itemText]) === -1
                ? theme.typography.fontWeightRegular
                : theme.typography.fontWeightMedium,
    };
}

export const ChipSelect = ({
    id,
    sx,
    value,
    lable,
    menuItems,
    onChange = () => { },
}) => {
    const theme = useTheme();
    return (
        <div>
            <FormControl
                id={`ChipSelectForm__${id}`}
                fullWidth
                sx={{
                    ...sx,
                }}
            >
                <InputLabel id={`ChipSelectLable__${id}`}>{lable}</InputLabel>
                <Select
                    labelId={`ChipSelectLable__${id}`}
                    id={`ChipSelect__${id}`}
                    multiple
                    value={value}
                    onChange={onChange}
                    input={
                        <OutlinedInput
                            id={`ChipSelect__OutlinedInput__${id}`}
                            label={lable}
                        />
                    }
                    renderValue={
                        (selected) => {
                            console.log(selected)
                            return (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.map((value) => (
                                        <Chip key={value} label={value} />
                                    ))}
                                </Box>
                            );
                        }
                    }
                    MenuProps={MenuProps}
                >
                    {menuItems.map((item) => (
                        <MenuItem
                            key={`ChipSelect__MenuItem__${id}__${item}`}
                            value={item}
                            style={getStyles(item, menuItems, value, theme)}
                        >
                            {item}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </div>
    );
}
