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
import { NoResultsCard } from '../NoResultsCard/NoResultsCard';

export const Main = ({
    // getIDSForPage,
    // getItemsForPage,
}) => {
    const MAX_REPEAT_REQ = 5;       // максимальное количество повторных запросов 
    const REPEAT_REQ_VIA = 1000;    // частота повтора запросов (повторять запросы через 1000мс)

    const { filterData, setFiletrData } = useContext(ContextFilterData);    // контекст через который передаем между компонентами информацию о фильтрации

    const [dataIsLoad, setDataIsLoad] = useState(true);                     // флаг загрузки данных если true - данные загружаются если false - данные загружены
    const [paginationDisabled, setPaginationDisabled] = useState(true);     // флаг блокировки пагинации если true - пагинация заблокирована false - пагинация доступна для действий пользователя
    const [pagesCount, setPagesCount] = useState(1);                        // количество страниц
    const [pageNumber, setPageNumber] = useState(1);                        // номер страницы
    const [IDs, setIDs] = useState(null);                                   // массив ID карточек товаров если null значит ID еще не были загружены
    const [itemsPerPage, setItemsPerPage] = useState(filterData.itemsPerPage);  // кол-во карточек на одну страницу
    const [items, setItems] = useState(null);                               // массив объектов с данными карточек товаров если null значит данные еще не были загружены
    const [errorsCounter, setErrorsCounter] = useState(0);                  // счетчик ошибок запросов данных нужен на случай если api не доступно или ошибка в коде


    /**
     * Колбэк функция смены страницы (пагинация)
     */
    const cbChangePage = useCallback((event, page) => {
        setDataIsLoad(true);    // переходим в режим загрузки данных
        setPageNumber(page);    // начинаем загрузку данных для определенной страницы
    }, []);

    /**
     * Функция вывода в консоль сообщения об ошибке и повторного запроса
     * @param {string} errorMessage текст сообщения об ошибке
     * @param {Function} repeatFunction функция которую необходимо повторно вызвать
     * 
     * Для работы функции должен существовать 
     * * const [errorsCounter, setErrorsCounter] = useState(0);
     * * MAX_REPEAT_REQ
     * * REPEAT_REQ_VIA
     * 
     * Необходимо для подсчета количества ошибок и выполнения повторного выполнения переданной в repeatFunction функции через определенное время
     */
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

    /**
     * Обновляет данные карточек
     */
    const updateDataInPage = () => {
        setPaginationDisabled(true);
        if (IDs.length) {
            getItems(IDs[pageNumber - 1]).then(
                (result) => {
                    // обработает успешное выполнение 
                    if (typeof result.items === 'string') {
                        sendReqErrorMessage(result.items, updateDataInPage);
                    }
                    else {
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
        else {
            setItems([]);
            setPaginationDisabled(false);
            setDataIsLoad(false);
        }
    }

    /** Обновляет ID карточек */
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

    /**
     * Принимает параметры фильтрации и согласно этих параметров запрашивает ID
     * @param {object} filterData объект содержащий в себе параметры фильтрации  
     * @returns {[string]} массив строк 
     */
    const getFilterData = async (filterData) => {
        let errorCounter = MAX_REPEAT_REQ;

        let result = [];
        let filterBrandResult = {
            IDs: [],
            errorsArray: []
        };
        let filterPriceResult = {
            IDs: [],
            errorsArray: []
        };
        let filterProductResult = {
            IDs: [],
            errorsArray: []
        };

        // получим ID после фильтрации по бренду
        if ((!filterData.brand.includes('Все')) || !filterData.brand) {
            // console.log('in brand')
            filterBrandResult = await ValantisFilter({
                field: 'brand',
                values: filterData.brand,
                errorCounter: errorCounter,
            });

            if (filterBrandResult.errors) {
                filterBrandResult.errors.forEach((error) => console.error(error));
            }
        }
        // console.log('end brands')
        // получим ID после фильтрации по Наименованию
        if (filterData.name) {
            console.log('in product')
            let tempName = filterData.name.replace(/^\s\s*/, '').replace(/\s\s*$/, ''); // убираем пробелы в начале и конце строки
            const namesArray = [
                tempName,                                                    // то что ввел пользователь
                tempName.toUpperCase(),                                      // в верхнем регистре
                tempName.toLowerCase(),                                      // в нижнем регистре
                tempName.charAt(0).toUpperCase() + tempName.slice(1)  // с заглавной буквы
            ]

            filterProductResult = await ValantisFilter({
                field: 'product',
                values: namesArray,
                errorCounter: errorCounter,
            });

            if (filterProductResult.errors) {
                filterProductResult.errors.forEach((error) => console.error(error));
            }
        }
        // console.log('end product')

        // получим ID после фильтрации по цене
        // if (filterData.price) {
        //     console.log('in price')
        //     filterPriceResult = await ValantisFilter({
        //         field: 'price',
        //         values: filterData.price,
        //         errorCounter: errorCounter,
        //     });

        //     if (filterPriceResult.errors) {
        //         filterPriceResult.errors.forEach((error) => console.error(error));
        //     }
        // }
        // console.log('end price')

        // обрабатываем результаты
        // console.log(filterBrandResult)
        // console.log(filterProductResult)
        // console.log(filterPriceResult)

        if (                                                                                       // Если ID есть
            (((!filterData.brand.includes('Все')) || !filterData.brand) && filterData.name) // ||  // от фильтров бренда и продукта
            // (filterData.name && filterData.price) ||                                            // от фильтров продукта и цены
            // ((filterData.price && (!filterData.brand.includes('Все'))) || !filterData.brand)    // от фильтров цены и бренда
        ) {
            filterBrandResult.IDs.forEach((brandID) => {
                if (
                    // filterPriceResult.IDs.includes(brandID) &&
                    filterProductResult.IDs.includes(brandID)
                ) {
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
            else if (filterProductResult.IDs.length) {
                result = filterProductResult.IDs;
            }
            else {
                // Тут уже не важно есть ID от фильтра цен или нет потому что если даже нет то запишем пустой массив в результат
                result = filterPriceResult.IDs;
            }
        }
        // console.log(result)
        return result;
    }

    useEffect(() => {
        if (IDs) {
            setPagesCount(IDs.length);
            updateDataInPage();
        }
        else {
            setDataIsLoad(true);
            // console.warn('Первый запрос IDs')
            updateIDsForPage();
        }
    }, [IDs, pageNumber]);

    useEffect(() => {
        if (
            ((!filterData.brand.includes('Все')) || !filterData.brand) ||
            // filterData.price ||
            filterData.name
        ) {
            setDataIsLoad(true);
            getFilterData(filterData).then(
                (result) => {
                    setItemsPerPage(filterData.itemsPerPage);
                    if (result) {
                        let IDsInPages = [];
                        for (let i = 0; i < result.length; i += itemsPerPage) {
                            IDsInPages.push(result.slice(i, i + itemsPerPage));
                            // do whatever
                        }
                        setIDs(IDsInPages);
                    }
                    else {
                        setIDs(null); // вызываем заново пересчет всего что на странице
                    }
                }
            );
        }
        else {
            if (filterData.itemsPerPage !== itemsPerPage) {
                setDataIsLoad(true);
                setItemsPerPage(filterData.itemsPerPage);
            }
            setIDs(null); // вызываем заново пересчет всего что на странице
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
                            items.length > 0 ?
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
                                (<NoResultsCard />)
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
