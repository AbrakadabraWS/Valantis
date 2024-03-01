
'use client'
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

export const BasicSelect = ({
    id,
    sx,
    value,
    lable,
    menuItems,
    onChange = () => { },
}) => {
    return (
        <FormControl
            id={`BasicSelectForm__${id}`}
            fullWidth
            sx={sx}
        >
            <InputLabel id={`BasicSelectLabel__${id}`}>{lable}</InputLabel>
            <Select
                labelId={`BasicSelectLabel__${id}`}
                id={`BasicSelect__${id}`}
                value={value}
                label={lable}
                onChange={onChange}
            >
                {
                    menuItems.map((menuItemData) => {
                        return <MenuItem key={`BasicSelect__MenuItem__${id}__${menuItemData.value}__${menuItemData.text}`} value={menuItemData.value}>{menuItemData.text}</MenuItem>;
                    })
                }
            </Select>
        </FormControl>
    );
}
