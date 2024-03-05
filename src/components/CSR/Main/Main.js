'use client'
import { useCallback, useContext, useEffect, useState } from 'react';
import { ContextFilterData } from '../Providers/Providers';
import styles from './Main.module.css'
import { Box } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import { ProductCard } from '../ProductCard/ProductCard';
import { PaginationPanel } from '../PaginationPanel/PaginationPanel';
import { ValantisFilter, getFields, getIDs, getItems } from '@/components/SSR/ValantisAPI';
import { LoadErrorCard } from '../LoadErrorCard/LoadErrorCard';

export const Main = ({
    // getIDSForPage,
    // getItemsForPage,
}) => {
    const MAX_REPEAT_REQ = 5;
    const REPEAT_REQ_VIA = 1000;

    const { filterData, setFiletrData } = useContext(ContextFilterData);

    const [dataIsLoad, setDataIsLoad] = useState(true);
    const [paginationDisabled, setPaginationDisabled] = useState(true);
    const [pagesCount, setPagesCount] = useState(1);
    const [pageNumber, setPageNumber] = useState(1);
    const [IDs, setIDs] = useState(null);
    const [itemsPerPage, setItemsPerPage] = useState(filterData.itemsPerPage);
    const [items, setItems] = useState(null);
    const [errorsCounter, setErrorsCounter] = useState(0);



    const cbChangePage = useCallback((event, page) => {
        setDataIsLoad(true);
        setPageNumber(page);
    }, []);

    const sendReqErrorMessage = (errorMessage, repeatFunction) => {
        console.error(errorMessage)
        setErrorsCounter(errorsCounter + 1);
        if (errorsCounter < MAX_REPEAT_REQ) {
            setTimeout(repeatFunction, REPEAT_REQ_VIA);
        }
        else {
            console.error(
                `Выполнено подряд ${MAX_REPEAT_REQ} неудачных запросов через каждые ${REPEAT_REQ_VIA}мс.\n` +
                `Попробуйте перезагрузить страницу.`
            );
        }
    }

    const updateDataInPage = () => {
        setPaginationDisabled(true);
        getItems(IDs[pageNumber - 1]).then(
            (result) => {
                // обработает успешное выполнение 
                if (typeof result.items === 'string') {
                    sendReqErrorMessage(result.items, updateDataInPage);
                }
                else {
                    console.log('data is load')
                    setErrorsCounter(0);
                    setItems(result);
                    setPaginationDisabled(false);
                    setDataIsLoad(false);
                }

            },
            (error) => {
                // обработает ошибку
                sendReqErrorMessage(`Ошибка во время запроса данных карточек: ${error}`, updateDataInPage);
            }

        );
    }

    const updateIDsForPage = () => {
        getIDs().then(
            (result) => {
                if (typeof result === 'string') {
                    sendReqErrorMessage(result, updateIDsForPage);
                }
                else {
                    let IDsInPages = [];
                    for (let i = 0; i < result.length; i += itemsPerPage) {
                        IDsInPages.push(result.slice(i, i + itemsPerPage));
                        // do whatever
                    }
                    setIDs(IDsInPages);
                }
            },
            (error) => {
                // обработает ошибку
                sendReqErrorMessage(`Ошибка во время запроса ID карточек: ${error}`, updateIDsForPage);
            }
        )
    }

    const getFilterData = async (filterData) => {
        let errorCounter = MAX_REPEAT_REQ;

        console.log(filterData)
        let result = [];
        let filterBrandResult = {
            IDs: [],
            errorsArray: []
        };
        let filterPriceResult = {
            IDs: [],
            errorsArray: []
        };;

        // получим ID после фильтрации по бренду
        if ((!filterData.brand.includes('Все')) || !filterData.brand) {
            console.log('in brand')
            filterBrandResult = await ValantisFilter({
                field: 'brand',
                values: filterData.brand,
                errorCounter: errorCounter,
            });

            if (filterBrandResult.errors) {
                filterBrandResult.errors.forEach((error) => console.error(error));
            }
        }
        console.log('end brands')
        // получим ID после фильтрации по цене
        if (filterData.price) {
            console.log('in price')
            filterPriceResult = await ValantisFilter({
                field: 'price',
                values: filterData.price,
                errorCounter: errorCounter,
            });

            if (filterPriceResult.errors) {
                filterPriceResult.errors.forEach((error) => console.error(error));
            }
        }
        console.log('end price')

        // обрабатываем результаты
        console.log(filterBrandResult)
        console.log(filterPriceResult)
        if (filterBrandResult.IDs.length > 0 && filterPriceResult.IDs.length > 0) {
            // Если ID есть и от фильтра брендов и от фильтра
            filterBrandResult.IDs.forEach((brandID) => {
                if (filterPriceResult.IDs.includes(brandID)) {
                    result.push(brandID);
                }
            });
        }
        else {
            // Если ID есть только от фильтра брендов или фильтра цен или их вовсе нет
            if (filterBrandResult.IDs.length) {
                // Если ID есть только от фильтра брендов
                result = filterBrandResult.IDs;
            }
            else {
                // Тут уже не важно есть ID от фильтра цен или нет потому что если даже нет то запишем пустой массив в результат
                result = filterPriceResult.IDs;
            }
        }
        console.log('----------------------------------')
        return result;
    }

    useEffect(() => {
        console.log('rerender Effect')

        if (IDs) {
            setPagesCount(IDs.length);
            updateDataInPage();
        }
        else {
            setDataIsLoad(true);
            console.warn('Первый запрос IDs')
            updateIDsForPage();
        }
    }, [IDs, pageNumber]);

    useEffect(() => {
        console.log('filterData  Effect')
        console.log(filterData)



        if (
            ((!filterData.brand.includes('Все')) || !filterData.brand) ||
            filterData.price
        ) {
            setDataIsLoad(true);
            getFilterData(filterData).then(
                (result) => {
                    console.log(result)
                    setItemsPerPage(filterData.itemsPerPage);
                    setIDs(result); // вызываем заново пересчет всего что на странице
                }
            );
        }
        else {
            if (filterData.itemsPerPage !== itemsPerPage) {
                setDataIsLoad(true);
                setItemsPerPage(filterData.itemsPerPage);
                setIDs(null); // вызываем заново пересчет всего что на странице
            }
        }
    }, [filterData]);

    return (
        <Box
            // className={styles.main}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                flex: '1 0 auto',
            }}
        >
            <Box
                // className={styles.main__cards}
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: '1 0 auto',
                    flexBasis: 0,
                    overflowY: 'scroll',
                    scrollbarGutter: 'stable',
                    bgcolor: '#ebebeb',
                    justifyContent: dataIsLoad ? 'center' : 'normal',
                    alignItems: dataIsLoad ? 'center' : 'normal',
                }}
            >
                {
                    dataIsLoad ?
                        (
                            <CircularProgress
                                color="inherit"
                                size={'8em'}
                            />
                        )
                        :
                        Array.isArray(items) ?
                            items.map((item) => {
                                return (
                                    <ProductCard
                                        key={item.id}
                                        id={item.id}
                                        product={item.product}
                                        price={item.price}
                                        brand={item.brand}
                                    />
                                )
                            })
                            :
                            (
                                <LoadErrorCard />
                            )

                }
            </Box>
            {
                pagesCount >= 2 && (
                    <PaginationPanel
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            flex: '0 0 auto',
                            py: 1,
                            borderTop: '2px solid #ebebeb',
                        }}
                        pageCount={pagesCount}
                        onChange={cbChangePage}
                        disabled={paginationDisabled}
                    />
                )
            }

        </Box>

    )
}
