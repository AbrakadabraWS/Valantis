// import 'server-only';
import { MD5 } from 'crypto-js';

const KEY_WORD = 'Valantis';
const URL = 'https://api.valantis.store:41000/';
const TIMEZONE = -3; // местное время сервера UTC-3 ??? не верное время на сервере???
const FIELDS_VARIANTS = [
    'brand',
    // 'id', // нет смысла использовать getFields для получения писка id хотя в принципе возможно
    'price',
    'product',
];

const getAuthKey = () => {
    const actualDate = new Date();
    actualDate.setHours(actualDate.getHours() + TIMEZONE); // поправка на местное время сервера
    const fullYear = actualDate.getFullYear();
    const mounth = actualDate.getMonth() + 1;
    const dateDay = actualDate.getDate();
    const PASSWORD = `${fullYear}${mounth < 10 ? `0${mounth}` : mounth}${dateDay < 10 ? `0${dateDay}` : dateDay}`;
    return MD5(`${KEY_WORD}_${PASSWORD}`).toString();
};

const checkArrayRepetitions = (mainArray) => {
    let resultArray = [];
    mainArray.forEach((item) => {
        if (!resultArray.includes(item)) {
            resultArray.push(item);
        }
    });
    return resultArray;
}

const checkItemArrayRepetitions = (itemArray) => {
    // console.log(itemArray)
    let resultArray = [];
    itemArray.forEach((item) => {
        if (!resultArray.find((itemFromResultArray) => itemFromResultArray.id === item.id)) {
            resultArray.push(item);
        }
    });
    return resultArray;
}

export const ValantisAPIPOSTrequest = async (raw) => {
    console.log('*** in ValantisAPIPOSTrequest ***');

    let ValantisRes;

    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('X-Auth', `${getAuthKey()}`);

    let requestOptions = {
        method: 'POST',
        headers: headers,
        body: raw,
        redirect: 'follow'
    };

    const response = await fetch(URL, { ...requestOptions, cache: 'no-store' });

    if (response.ok) {
        ValantisRes = await response.json();
        return ValantisRes.result;
    }
    else {
        return `Ошибка HTTP: ${response.status}`;
    }
};

// * @param {Number} limit - положительное целое число. Определяет желаемое число возвращаемых записей.
// * @param {Number} offset - положительное целое число. Определяет смещение относительно начала списка.

/**
 * Возвращает упорядоченный список идентификаторов товаров.
 * Далее по выбранным идентификаторам можно запросить подробную информацию о товаре.
 * По умолчанию возвращает идентификаторы всех имеющиеся товаров.
 */
export const getIDs = async (
    limit = 0,
    // offset = 0
) => {
    console.log('*** in getIDs ***');

    let ids;

    let rawInJSON = {
        'action': 'get_ids',
    };

    // if (offset > 0) {
    //     rawInJSON.params = { 'offset': offset };
    // }

    if (limit > 0) {
        rawInJSON.params = { ...rawInJSON.params, 'limit': limit }
    }


    ids = await ValantisAPIPOSTrequest(
        JSON.stringify(rawInJSON)
    );

    if (typeof ids !== 'string') {
        ids = checkArrayRepetitions(ids);
    }

    //если добавить возможность устанавливать лимит то нужно дописать код по добавлению недостающих элементов после чистки списка
    return ids;
};

/**
 * Возвращает упорядоченный список товаров со всеми характеристиками, если переданы идентификаторы товаров.
 * Максимум 100 записей.
 * @param {[String]} ids  - упорядоченный список строк. Определяет идентификаторы товаров, которые будут возвращены.
 */
export const getItems = async (ids = []) => {
    console.log('*** in getItems ***');

    let items;

    let rawInJSON = {
        'action': 'get_items',
    };

    if (ids.length > 100) {
        return 'В аргументы getItems передано больше 100 id товаров';
    }
    else if (ids.length < 1) {
        return 'В аргументы getItems не переданы id товаров';
    }
    else {
        rawInJSON.params = { 'ids': ids };
    }

    items = await ValantisAPIPOSTrequest(
        JSON.stringify(rawInJSON)
    );

    if (items.length === 0) {
        items = `Ошибка сервера!\n` +
            `Код ответа сервера: 200\n` +
            `Количество полученных элементов: ${items.length}\n` +
            `Количество запрошенных элементов: ${ids.length}`
    }

    if (typeof items !== 'string') {
        items = checkItemArrayRepetitions(items)
    }

    return items;

};

/**
 * Без параметров возвращает упорядоченный список имеющихся полей товаров.
 * При передаче параметра field возвращает упорядоченный список значений данного поля товаров.
 * @param {string} field - строка. Должна содержать действительное название поля товара.
 * @param {Number} limit - положительное целое число. Определяет смещение относительно начала списка.
 * @param {Number} offset - положительное целое число. Определяет желаемое число возвращаемых записей.
 */
export const getFields = async ({ field, limit, offset }) => {
    console.log('*** in getFields ***');

    let fieldsArray = [];

    let rawInJSON = {
        'action': 'get_fields',
    };

    if (FIELDS_VARIANTS.includes(field)) {
        rawInJSON.params = { 'field': field };
    }
    else {
        return 'Передано не верное значение аргумента field';
    }

    if (offset > 0) {
        rawInJSON.params = { ...rawInJSON.params, 'offset': offset };
    }

    if (limit > 0) {
        rawInJSON.params = { ...rawInJSON.params, 'limit': limit }
    }

    fieldsArray = await ValantisAPIPOSTrequest(
        JSON.stringify(rawInJSON)
    );

    fieldsArray = checkArrayRepetitions(fieldsArray);

    return fieldsArray;
};

// filter - используется для фильтрации.
// Возвращает упорядоченный список идентификаторов товаров, соответствующих заданному значению.
// Параметры:
// В качестве параметра может использоваться любое поле возвращаемое методом get_fields без параметров.
// В качестве значения должен использоваться тип данных соответствующий полю.
// Для поля product будет проверяться вхождение параметра в строку.
// Для остальных полей проверяется строгое соответствие.


export const ValantisFilter = async ({ field, value }) => {
    console.log('*** in Filter ***');
    let filterArray = [];
    let rawInJSON = {
        'action': 'filter',
    };

    if (FIELDS_VARIANTS.includes(field)) {
        rawInJSON.params = { [`${field}`]: value };
    }
    else {
        return 'Передано не верное значение аргумента field';
    }

    filterArray = await ValantisAPIPOSTrequest(
        JSON.stringify(rawInJSON)
    );

    return filterArray;
};  
