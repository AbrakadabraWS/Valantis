'use client'// Закомментировать если хотим запросы в API через сервер (не работает npm run build и соответственно на gitPages)
// import * as React from 'react';
import Box from '@mui/material/Box';
import { FilterPanel } from '@/components/CSR/FilterPanel/FilterPanel';
import { Main } from '@/components/CSR/Main/Main'; // Закомментировать если хотим запросы в API через сервер (не работает npm run build и соответственно на gitPages)
import { getFields } from '@/components/SSR/ValantisAPI';

/*  Раскомментировать если хотим запросы в API через сервер (не работает npm run build и соответственно на gitPages)
import { ValantisFilter, getFields, getIDs, getItems } from '@/components/SSR/ValantisAPI'; 
import { Main } from '@/components/CSR/Main/MainForSSR';

async function getItemsForPage(IDs, pageNumber, itemsPerPage) {
  "use server"
  console.log('in getItemsForPage');
  console.log(IDs.length);
  console.log(pageNumber);
  console.log(itemsPerPage);

  let IDsInPages = [];
  for (let i = 0; i < IDs.length; i += itemsPerPage) {
    IDsInPages.push(IDs.slice(i, i + itemsPerPage));
    // do whatever
  }
  let Items = await getItems(IDsInPages[pageNumber - 1]);

  // console.log(Items)
  // console.log(IDsInPages)
  let result = {
    Items: Items,
    pageNumber: pageNumber,
    itemsPerPage: itemsPerPage,
  };
  return result
}

async function getIDSForPage() {
  'use server'

  console.log('in getIDSForPage');
  let IDs = getIDs();
  return IDs;
}
*/

export default async function HomePage() {
  const cbGetFields = async (field) => {  // запрос списка имеющихся полей товаров.
    return getFields({ field: field });
  }

  return (
    <Box
      // className={styles.homePage}
      sx={{
        display: 'flex',
        flexDirection: 'row',
        flex: '1 0 auto',
      }}
    >
      <FilterPanel
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: '400px',
        }}
        getFields={cbGetFields}
      />

      <Main
      // Раскомментировать если хотим запросы в API через сервер (не работает npm run build и соответственно на gitPages)
      // getIDSForPage={getIDSForPage}      
      // getItemsForPage={getItemsForPage}
      />
    </Box>
  );
}
