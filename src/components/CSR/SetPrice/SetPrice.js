'use client'
import { forwardRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
// import { IMaskInput } from 'react-imask';
import { NumericFormat } from 'react-number-format';
import { FormControl, Stack, TextField, Alert } from '@mui/material';

const NumericFormatCustom = forwardRef(             // forwardRef(), чтобы позволить компоненту получить ref родителя и передать дочернему компоненту
    function NumericFormatCustom(props, ref) {
        const { onChange, ...other } = props;

        return (
            <NumericFormat
                {...other}
                getInputRef={ref}                   // Метод получения ссылки на входные данные, span (на основе реквизита DisplayType) или ссылки на customInput.
                onValueChange={(values) => {        // Этот обработчик предоставляет доступ к любым изменениям значений в поле ввода и запускается только при изменении реквизита или пользовательского ввода.
                    onChange({
                        target: {
                            name: props.name,
                            value: values.value,
                        },
                    });
                }}
                allowNegative={false}               // Запрещаем отрицательные числа
                decimalScale={2}                    // до 2х десятичных знаков 
                thousandSeparator={' '}             // Определяет разделитель группировки тысяч.
                /* valueIsNumericString
                   Если значение передается как строковое представление чисел (неформатированное), а разделитель тысяч.
                   в числовом формате или число используется в реквизитах любого формата,
                   например в префиксе или суффиксе в числовом формате и в реквизите формата в формате шаблона,
                   то это должно быть передано как true.
                */
                valueIsNumericString
                prefix="₽"                          // префикс в начале строки ввода (в данном случае символ рубля)
            />
        );
    },
);

NumericFormatCustom.propTypes = {
    name: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
};

export const SetPrice = ({
    id,
    sx,
    priceList,
    onChange = (newPrice) => { },
}) => {
    const [values, setValues] = useState({
        from: priceList[0] || '0',
        to: priceList[priceList.length - 1] || '0',
    });
    const [inputErrorStatus, setInputErrorStatus] = useState(false);

    const handleChange = (event) => {
        const newValues = {
            ...values,
            [event.target.name]: event.target.value,
        }

        if (Number(newValues.from) > Number(newValues.to)) {
            setInputErrorStatus(true);
            console.error('Filter SetPrice error:Значение начальной суммы дольжно быть меньше значения конечной сумыы!');
        }
        else {
            setInputErrorStatus(false);
        }

        let newPrice = [];


        priceList.forEach((priceItem) => {
            if (priceItem >= newValues.from && priceItem <= newValues.to) {
                newPrice.push(priceItem);
            }
        });

        setValues(newValues);
        onChange(newPrice);

    };

    useEffect(() => {
        setValues({
            from: priceList[0] || '0',
            to: priceList[priceList.length - 1] || '0',
        })
    }, [priceList])

    return (
        <FormControl
            id={`SetPriceForm__${id}`}
            fullWidth
            sx={sx}
        >
            Цена:
            <Stack
                id={`SetPriceStack__${id}`}
                sx={sx}
                direction="row"
                spacing={2}
            >
                <TextField
                    label="от"
                    error={inputErrorStatus}
                    value={values.from}
                    onChange={handleChange}
                    name="from"
                    id={`SetPriceTextField__From${id}`}
                    InputProps={{
                        inputComponent: NumericFormatCustom,
                    }}
                />
                <TextField
                    label="до"
                    error={inputErrorStatus}
                    value={values.to}
                    onChange={handleChange}
                    name="to"
                    id={`SetPriceTextField__To${id}`}
                    // InputProps:
                    // Prop, применяемые к элементу ввода. 
                    // Это будет FilledInput, OutlinedInput или Input в зависимости от значения параметра prop.
                    InputProps={{
                        inputComponent: NumericFormatCustom,
                    }}
                />
            </Stack>
            {
                inputErrorStatus &&
                <Alert
                    id={`SetPriceAlert__${id}`}
                    sx={{ mt: 1 }}
                    variant="outlined"
                    severity="error"
                >
                    Начальная цена должна быть больше конечной!
                </Alert>
            }
        </FormControl >
    );
}
