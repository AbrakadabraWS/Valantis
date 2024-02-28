// import * as React from 'react';
import Box from '@mui/material/Box';
import { ValantisFilter, getFields, getIDs, getItems } from '@/components/SSR/ValantisAPI';
import { Main } from '@/components/CSR/Main/Main';
import { FilterPanel } from '@/components/CSR/FilterPanel/FilterPanel';

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

export default async function HomePage() {
  console.log('*** in HomePage ***');

  // console.log(Items)
  // let fields = await getFields({ field: 'brand' });
  // console.log(fields)
  // let filter = await ValantisFilter({ field: 'brand', value: 'Mauboussin' });
  // console.log(filter)
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
          width: '400px',
        }}
      />

      <Main
        getIDSForPage={getIDSForPage}
        getItemsForPage={getItemsForPage}
      />
    </Box>
  );
}
