'use client'
import { useCallback, useContext, useEffect, useState } from 'react';
import { Box, Button } from '@mui/material';
import { BasicSelect } from '../Select/Basic/BasicSelect';
import { ChipSelect } from '../Select/Chip/ChipSelect';
import { SetPrice } from '../SetPrice/SetPrice';
import { ContextFilterData } from '../Providers/Providers';
import { NameSearch } from '../NameSearch/NameSearch';


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

const compareNumeric = (a, b) => {
    if (a > b) return 1;
    if (a == b) return 0;
    if (a < b) return -1;
}

export const FilterPanel = ({
    sx,
    getFields = async () => { },
}) => {
    const REPEAT_REQ_VIA = 100;

    const { filterData, setFiletrData } = useContext(ContextFilterData);

    const [reset, setReset] = useState(true);
    const [itemsPerPage, setItemsPerPage] = useState(itemsPerPageList[3].value);

    const [brandsList, setBrandsList] = useState(['Все']);
    const [brand, setBrand] = useState([brandsList[0]]);

    const [priceList, setPriceList] = useState([0]);
    const [price, setPrice] = useState(null);

    const [nameSeatch, setNameSeatch] = useState('');

    const getBrandList = () => {
        getFields('brand').then(
            (result) => {
                if (typeof result === 'string') {
                    console.error(result);
                    setTimeout(getBrandList(), REPEAT_REQ_VIA);
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

                    result.unshift('Все');
                    setBrandsList(result);
                }
            },
            (error) => {
                console.error(error);
                setTimeout(getBrandList(), REPEAT_REQ_VIA);
            }
        );
    }

    const getPriceList = () => {
        getFields('price').then(
            (result) => {
                if (typeof result === 'string') {
                    console.error(result);
                    setTimeout(getBrandList(), REPEAT_REQ_VIA);
                }
                else {
                    setPriceList(result.sort(compareNumeric))
                }
            },
            (error) => {
                console.error(error);
                setTimeout(getBrandList(), REPEAT_REQ_VIA);

            }
        );
    }

    const cbOnChange__itemsPerPage = useCallback((event) => {
        setItemsPerPage(event.target.value);
    }, []);

    const cbOnChange__brand = useCallback((event) => {
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

    const cbOnChange__price = useCallback((newPrice) => {
        setPrice(newPrice);
    }, []);

    const cbOnChange__NameSeatch = useCallback((name) => {
        setNameSeatch(name);
    }, []);


    const cbOnClick__ButtonClearFilter = useCallback(() => {

        if (
            itemsPerPage !== itemsPerPageList[3].value ||
            !brand.includes(brandsList[0]) ||
            price.length !== priceList.length ||
            nameSeatch !== ''
        ) {
            setItemsPerPage(itemsPerPageList[3].value);
            setBrand([brandsList[0]]);
            setPrice(priceList);
            setNameSeatch('');

            setFiletrData({
                itemsPerPage: itemsPerPageList[3].value,
                brand: [brandsList[0]],
                price: null,
                name: '',
            });
            setReset(true);
        }
    }, [itemsPerPage, brand, nameSeatch, price, priceList]);

    const cbOnClick__ButtonApply = useCallback(() => {
        setFiletrData({
            itemsPerPage,
            brand: brand.length === brandsList.length ? ['Все'] : brand,
            price: price.length === priceList.length ? null : price,
            name: nameSeatch,
        })
    }, [itemsPerPage, brand, brandsList, price, priceList, nameSeatch]);

    useEffect(() => {
        if (reset) {
            getBrandList();
            getPriceList();
            setReset(false);
        }
    }, [reset]);
    return (

        <Box
            // className={styles.filterPanel__cards}
            sx={{
                ...sx,
                py: 3,
                px: 2,
            }}
        >
            <BasicSelect
                id={'itemsPerPage'}
                value={itemsPerPage}
                lable={'Элементов на странице'}
                menuItems={itemsPerPageList}
                onChange={cbOnChange__itemsPerPage}
            />


            <ChipSelect
                id={'brand'}
                sx={{
                    mt: 2,
                }}
                value={brand}
                lable={'Производитель'}
                menuItems={brandsList}
                onChange={cbOnChange__brand}
            />

            <SetPrice
                id={'price'}
                sx={{
                    mt: 2,
                }}
                priceList={priceList}
                onChange={cbOnChange__price}
            />

            <NameSearch
                id={'NameSearch'}
                sx={{
                    mt: 2,
                }}
                onChange={cbOnChange__NameSeatch}
            />
            <Button
                id='FilterPanel__ButtonApply'
                sx={{
                    mt: 2,
                }}
                variant="contained"
                color="success"
                onClick={cbOnClick__ButtonApply}
            >
                Применить
            </Button>

            <Button
                id='FilterPanel__ButtonClearFilter'
                sx={{
                    mt: 2,
                }}
                variant="outlined"
                color="success"
                onClick={cbOnClick__ButtonClearFilter}
            >
                Сбросить
            </Button>
        </Box>
    )
}
