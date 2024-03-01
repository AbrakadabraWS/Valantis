'use client'
import { useCallback, useEffect, useState } from 'react';
import styles from './FilterPanel.module.css'
import { Box, FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material';
import { BasicSelect } from '../Select/Basic/BasicSelect';
import { ChipSelect } from '../Select/Chip/ChipSelect';


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

export const FilterPanel = ({
    sx,
    getFields = async () => { },
}) => {
    const [itemsPerPage, setItemsPerPage] = useState(itemsPerPageList[3].value);

    const [brandsList, setBrandsList] = useState(['Все']);
    const [brand, setBrand] = useState([brandsList[0]]);

    const cbSelect__itemsPerPage = useCallback((event) => {
        setItemsPerPage(event.target.value);
    }, []);

    const cbSelect__brand = useCallback((event) => {
        let {
            target: { value },
        } = event;

        if ((value.length > 1 && value[value.length - 1] === 'Все') || value.length === 0) {
            value = ['Все'];
        }
        else if (value.length > 1 && value.indexOf('Все') !== -1) {
            value.splice(value.indexOf('Все'), 1);
        }

        setBrand(
            // On autofill we get a stringified value.
            typeof value === 'string' ? value.split(',') : value,
        );
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
                            return 'No name';
                        }
                        else {
                            return brandItem;
                        };

                    });
                }
                result.unshift('Все');
                setBrandsList(result);
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
            <BasicSelect
                id={'itemsPerPage'}
                value={itemsPerPage}
                lable={'Элементов на странице'}
                menuItems={itemsPerPageList}
                onChange={cbSelect__itemsPerPage}
            />


            <ChipSelect
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
