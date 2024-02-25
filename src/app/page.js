import * as React from 'react';
import Box from '@mui/material/Box';
import { ValantisFilter, getFields, getIDs, getItems } from '@/components/SSR/ValantisAPI';


export default async function HomePage() {
  console.log('*** in HomePage ***')
  let IDs = await getIDs({ limit: 10 });
  console.log(IDs)
  let Items = await getItems(IDs);
  console.log(Items)
  let fields = await getFields({ field: 'brand' });
  console.log(fields)
  let filter = await ValantisFilter({ field: 'brand', value: 'Mauboussin' });
  console.log(filter)
  return (
    <Box sx={{ display: 'flex' }}>
      Привет!
    </Box>
  );
}
