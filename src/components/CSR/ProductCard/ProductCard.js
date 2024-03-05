'use client'
import { Card, CardContent, Typography } from '@mui/material';
// import { useState } from 'react';

export const ProductCard = ({
    id,
    product,
    price,
    brand,
    // onClick
}) => {
    return (
        <Card
            sx={{
                display: 'flex',
                flex: '0 0 auto',
                m: 1,
                minWidth: 370,
            }}
        >
            <CardContent>
                <Typography variant="h6" >
                    {product}
                </Typography>
                <Typography variant="h5" color={'#C09500'}>
                    {price}
                </Typography>
                <Typography sx={{ mb: 1 }} color="text.secondary">
                    Производитель: {brand === null ? 'No name' : brand}
                </Typography>
                <Typography sx={{ fontSize: 12 }} color="text.secondary" gutterBottom>
                    id: {id}
                </Typography>
            </CardContent>
            {/* <CardActions>
                <Button size="small" onClick={onClick}>Подробнее</Button>
            </CardActions> */}
        </Card>
    );
}
