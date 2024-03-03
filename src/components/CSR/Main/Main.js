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

    const updateDataInPage = () => {
        setPaginationDisabled(true);
        getItems(IDs[pageNumber - 1]).then(
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
                    console.log('data is load')
                    setErrorsCounter(0);
                    setItems(result);
                    setPaginationDisabled(false);
                    setDataIsLoad(false);
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
        getIDs().then(
            (result) => {
                if (typeof result === 'string') {
                    console.error(result);
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
        console.log('rerender')

        if (IDs) {
            setPagesCount(IDs.length);
            updateDataInPage();
        }
        else {
            setDataIsLoad(true);
            console.error('Первый запрос IDs')
            updateIDsForPage();
        }
    }, [IDs, pageNumber]);

    useEffect(() => {
        console.log('filterData')
        console.log(filterData)
        setItemsPerPage(filterData.itemsPerPage);
        setIDs(null); // вызываем заново пересчет всего что на странице
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
