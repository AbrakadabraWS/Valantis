import * as React from 'react';
import './global.css';
import ThemeRegistry from '@/components/ThemeRegistry/ThemeRegistry';
import { Box } from '@mui/material';

export const metadata = {
  title: 'Тестовое задание',
  description: 'Тестовое задание',
};

const DRAWER_WIDTH = 240;

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>
        <ThemeRegistry>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              flex: '1 0 auto',
            }}
          >

            {children}
            <Box
              sx={{
                display: 'flex',
                flex: '0 0 auto',
                justifyContent: 'center',
                borderTop: '2px solid #ebebeb',
              }}
            >
              By Abrakadabra worckshop 2024
            </Box>
          </Box>
        </ThemeRegistry>
      </body>
    </html>
  );
}
