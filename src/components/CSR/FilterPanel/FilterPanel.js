'use client'
import { useCallback, useEffect, useState } from 'react';
import styles from './FilterPanel.module.css'
import { Box, FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material';


const itemsPerPageList = [
    {
        value: 5,
        text: '5',
    },
    {
        value: 10,
        text: '10',
    },
    {
        value: 25,
        text: '25',
    },
    {
        value: 50,
        text: '50',
    },
    {
        value: 75,
        text: '75',
    },
]


const FilterPanelSelect = ({
    id,
    sx,
    value,
    lable,
    menuItems,
    onChange = () => { },
}) => {
    return (
        <FormControl
            id={`FilterPanel__selectForm__${id}`}
            fullWidth
            sx={sx}
        >
            <InputLabel id={`FilterPanel__selectLabel__${id}`}>{lable}</InputLabel>
            <Select
                labelId={`FilterPanel__selectLabel__${id}`}
                id={`FilterPanel__select__${id}`}
                value={value}
                label={lable}
                onChange={onChange}
            >
                {
                    menuItems.map((menuItemData) => {
                        return <MenuItem key={`${id}__MenuItem__${menuItemData.value}__${menuItemData.text}`} value={menuItemData.value}>{menuItemData.text}</MenuItem>;
                    })
                }
            </Select>
        </FormControl>
    );
}



export const FilterPanel = ({
    sx,
    getFields = async () => { },
}) => {
    const [itemsPerPage, setItemsPerPage] = useState(itemsPerPageList[3].value);

    const [brandsList, setBrandsList] = useState([{ value: 0, text: 'Все' }]);
    const [brand, setBrand] = useState(brandsList[0].value);

    const cbSelect__itemsPerPage = useCallback((event) => {
        setItemsPerPage(event.target.value);
    }, []);

    const cbSelect__brand = useCallback((event) => {
        setBrand(event.target.value);
    }, []);

    useEffect(() => {
        getFields('brand').then(
            (result) => {
                if (typeof result === 'string') {
                    console.error(result);
                }
                else {
                    result = result.map((brandItem, brandIndex) => {
                        if (brandItem === null) {
                            return {
                                value: brandIndex + 1,
                                text: 'No name',
                            };
                        }
                        else {
                            return {
                                value: brandIndex + 1,
                                text: brandItem,
                            };
                        }
                    });
                    result.unshift({ value: 0, text: 'Все' });
                    setBrandsList(result);
                }
            },
            (error) => {
                console.error(error)
            }
        );
    }, []);
    return (

        <Box
            // className={styles.filterPanel__cards}
            sx={{
                ...sx,
                py: 3,
                px: 1,
            }}
        >
            <FilterPanelSelect
                id={'itemsPerPage'}
                value={itemsPerPage}
                lable={'Элементов на странице'}
                menuItems={itemsPerPageList}
                onChange={cbSelect__itemsPerPage}
            />

            <FilterPanelSelect
                id={'brand'}
                sx={{
                    mt: 2,
                }}
                value={brand}
                lable={'Производитель'}
                menuItems={brandsList}
                onChange={cbSelect__brand}
            />

            <Button
                sx={{
                    mt: 2,
                }}
                variant="contained"
                color="success"
            >
                Применить
            </Button>
        </Box>
    )
}
