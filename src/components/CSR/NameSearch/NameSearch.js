

import { useCallback } from 'react'
import { FormControl, Stack, TextField, Alert } from '@mui/material';

export const NameSearch = ({
    id,
    sx,
    onChange = (name) => { },
}) => {

    const handleChange = useCallback((event) => {
        onChange(event.target.value);
    }, [])
    return (
        <FormControl
            id={`BasicSelectForm__${id}`}
            fullWidth
            sx={sx}
        >
            <TextField
                id="outlined-basic"
                label="Наименование"
                variant="outlined"
                onChange={handleChange}
            />
        </FormControl>
    )
}
