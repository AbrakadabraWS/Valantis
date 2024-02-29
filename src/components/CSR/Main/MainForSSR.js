'use client'
import styles from './Main.module.css'
import { Box } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import { ProductCard } from '../ProductCard/ProductCard';
import { PaginationPanel } from '../PaginationPanel/PaginationPanel';
import { useCallback, useEffect, useState } from 'react';

export const Main = ({
    getIDSForPage,
    getItemsForPage,
}) => {
    const [dataIsLoad, setDataIsLoad] = useState(true);
    const [paginationDisabled, setPaginationDisabled] = useState(true);
    const [pagesCount, setPagesCount] = useState(1);
    const [pageNumber, setPageNumber] = useState(1);
    const [IDs, setIDs] = useState(null);
    const [itemsPerPage, setItemsPerPage] = useState(50);
    const [items, setItems] = useState(null);
    const [errorsCounter, setErrorsCounter] = useState(0);

    const MAX_REPEAT_REQ = 5
    const REPEAT_REQ_VIA = 1000
    // let IDs = getIDs();

    const cbChangePage = useCallback((event, page) => {
        // console.log(event)
        console.log(page)
        setDataIsLoad(true);
        setPageNumber(page);
    }, []);

    const updateDataInPage = () => {
        setPaginationDisabled(true);
        getItemsForPage(IDs, pageNumber, itemsPerPage).then(
            (result) => {
                // обработает успешное выполнение 
                if (typeof result.items === 'string') {
                    console.error(result.items);
                    setErrorsCounter(errorsCounter + 1);
                    if (errorsCounter < MAX_REPEAT_REQ) {
                        setTimeout(updateDataInPage, REPEAT_REQ_VIA);
                    }
                    else {
                        console.error(
                            `Выполнено подряд ${MAX_REPEAT_REQ} неудачных запросов через каждые ${REPEAT_REQ_VIA}мс.\n` +
                            `Попробуйте перезагрузить страницу.`
                        );
                    }
                }
                else {
                    console.log('----------------------------------------------------')
                    console.log(pageNumber)
                    console.log(result.pageNumber)
                    console.log(result.pageNumber === pageNumber)
                    console.log(itemsPerPage)
                    console.log(result.itemsPerPage)
                    console.log(result.itemsPerPage === itemsPerPage)
                    console.log('----------------------------------------------------')

                    if (result.pageNumber === pageNumber && result.itemsPerPage === itemsPerPage) {
                        setErrorsCounter(0);
                        setItems(result.Items);
                        setPaginationDisabled(false);
                        setDataIsLoad(false);
                    }
                }

            },
            (error) => {
                // обработает ошибку
                console.error(`in getItemsForPage error: ${error}`)
                setErrorsCounter(errorsCounter + 1);
                if (errorsCounter < MAX_REPEAT_REQ) {
                    setTimeout(updateDataInPage, REPEAT_REQ_VIA);
                }
                else {
                    console.error(
                        `Выполнено подряд ${MAX_REPEAT_REQ} неудачных запросов через каждые ${REPEAT_REQ_VIA}мс.\n` +
                        `Попробуйте перезагрузить страницу.`
                    );
                }
            }
        );
    }

    const updateIDsForPage = () => {
        getIDSForPage().then(
            (result) => {
                if (typeof result === 'string') {
                    console.error(result);
                    updateIDsForPage();
                }
                else {
                    setIDs(result);
                }
            },
            (error) => {
                // обработает ошибку
                console.error(`in updateIDsForPage error: ${error}`)
                setErrorsCounter(errorsCounter + 1);
                if (errorsCounter < MAX_REPEAT_REQ) {
                    setTimeout(updateIDsForPage, REPEAT_REQ_VIA);
                }
                else {
                    console.error(
                        `Выполнено подряд ${MAX_REPEAT_REQ} неудачных запросов через каждые ${REPEAT_REQ_VIA}мс.\n` +
                        `Попробуйте перезагрузить страницу.`
                    );
                }
            }
        )
    }

    useEffect(() => {
        if (IDs) {
            setPagesCount(Math.ceil(IDs.length / itemsPerPage));
            updateDataInPage();
        }
        else {
            setDataIsLoad(true);
            console.error('Первый запрос IDs')
            updateIDsForPage();
        }
    }, [IDs, pageNumber]);

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
                        ) :
                        items?.map((item) => {
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
