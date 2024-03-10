'use client'
import { createContext, useContext, useMemo, useState } from 'react';

export const ContextFilterData = createContext();

export const Providers = ({ children }) => {
    const [filterData, setFiletrData] = useState({
        itemsPerPage: 50,
        brand: ['Все'],
        price: null,
        name: '',
    });

    const value = useMemo(() => ({ filterData, setFiletrData }), [filterData]);

    return (
        <ContextFilterData.Provider value={value}>
            {children}
        </ContextFilterData.Provider>
    )
}
