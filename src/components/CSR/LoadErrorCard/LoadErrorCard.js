'use client'
import { Card, CardContent, CardActions, Typography, Button } from '@mui/material';

export const LoadErrorCard = ({
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
                <Typography variant="h6" >
                    Во время загрузки произошла ошибка :(
                </Typography>
            </CardContent>
            <CardActions>
                <Button
                    variant="contained"
                    size="large"
                    onClick={() => window.location.reload()}
                >
                    Перезагрузить страницу
                </Button>
            </CardActions>
        </Card>
    );
}
