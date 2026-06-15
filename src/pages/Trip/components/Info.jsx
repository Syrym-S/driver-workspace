import { useContext, useEffect, useState } from 'react';

import {
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Box,
  Grid,
  Stack,
  Chip,
  Divider,
} from '@mui/material';

import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';

import { getLeadInfo } from '../api/api';
import { useApp } from '../../../app/context';

const Item = ({ label, value }) => (
  <Box>
    <Typography
      variant="caption"
      color="text.secondary"
    >
      {label}
    </Typography>

    <Typography fontWeight={500}>
      {value || '—'}
    </Typography>
  </Box>
);

const Info = ({ tripId }) => {
  const { openLead: info, setOpenLead } = useApp();


  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 4,
      }}
    >
      {/* TITLE */}
      <Box
        display="flex"
        alignItems="center"
        gap={1}
        mb={3}
      >
        <InfoOutlinedIcon color="primary" />

        <Typography
          variant="h6"
          fontWeight={700}
        >
          Информация о рейсе
        </Typography>
      </Box>

      {/* CONTENT */}
      {info && (
        <Stack spacing={3}>
          {/* STATUS */}
          <Box>
            <Chip
              label={info.status}
              color={
                info.status === 'new'
                  ? 'error'
                  : 'primary'
              }
            />
          </Box>

          {/* ROUTE */}
          <Box>
            <Box
              display="flex"
              alignItems="center"
              gap={1}
              mb={2}
            >
              <RouteOutlinedIcon color="primary" />

              <Typography fontWeight={700}>
                Маршрут
              </Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 3,
                  }}
                >
                  <Item
                    label="Откуда"
                    value={[
                      info.route?.from?.country,
                      info.route?.from?.region,
                      info.route?.from?.city,
                      info.route?.from?.address,
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  />
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 3,
                  }}
                >
                  <Item
                    label="Куда"
                    value={[
                      info.route?.to?.country,
                      info.route?.to?.region,
                      info.route?.to?.city,
                      info.route?.to?.address,
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  />
                </Paper>
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* CARGO */}
          <Box>
            <Box
              display="flex"
              alignItems="center"
              gap={1}
              mb={2}
            >
              <LocalShippingOutlinedIcon color="primary" />

              <Typography fontWeight={700}>
                Груз
              </Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Item
                  label="Название"
                  value={info.cargo?.name}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Item
                  label="Тип"
                  value={info.cargo?.type}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Item
                  label="Вес"
                  value={`${info.cargo?.weight_kg || 0} кг`}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Item
                  label="Размеры"
                  value={`${info.cargo?.length_cm || 0} × ${info.cargo?.width_cm || 0} × ${info.cargo?.height_cm || 0} см`}
                />
              </Grid>

              <Grid item xs={12}>
                <Item
                  label="Описание"
                  value={info.cargo?.description}
                />
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* DRIVER */}
          <Box>
            <Box
              display="flex"
              alignItems="center"
              gap={1}
              mb={2}
            >
              <PersonOutlineOutlinedIcon color="primary" />

              <Typography fontWeight={700}>
                Водитель
              </Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Item
                  label="ФИО"
                  value={info.driver?.name}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Item
                  label="ИИН"
                  value={info.driver?.iin}
                />
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* CUSTOMER */}
          <Box>
            <Box
              display="flex"
              alignItems="center"
              gap={1}
              mb={2}
            >
              <BusinessOutlinedIcon color="primary" />

              <Typography fontWeight={700}>
                Заказчик
              </Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <Item
                  label="Название"
                  value={info.customer?.name}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Item
                  label="Тип"
                  value={info.customer?.type}
                />
              </Grid>
            </Grid>
          </Box>
        </Stack>
      )}
    </Paper>
  );
};

export default Info;