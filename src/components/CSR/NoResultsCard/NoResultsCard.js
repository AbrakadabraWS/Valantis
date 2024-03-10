'use client'
import { Card, CardContent, CardActions, Typography, Button } from '@mui/material';

export const NoResultsCard = ({
}) => {
    return (
        <Card
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flex: '0 0 auto',
                m: 1,
                minWidth: 370,
            }}
        >
            <CardContent>
                <Typography variant="h4" >
                    Товаров по вашему запросу не найдено :(
                </Typography>
                <Typography variant="h6" >
                    Пропробуйте изменить критерии фильтров.
                </Typography>
            </CardContent>
        </Card>
    );
}
