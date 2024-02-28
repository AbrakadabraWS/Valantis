import styles from './PaginationPanel.module.css'
import { Box, Pagination } from '@mui/material';


export const PaginationPanel = ({
    sx,
    pageCount,
    disabled,
    onChange = (event, page) => { },
}) => {
    return (
        <Box
            // className={}
            sx={sx}
        >
            <Pagination
                count={pageCount}
                onChange={onChange}
                disabled={disabled}
            />

        </Box>
    );
}
