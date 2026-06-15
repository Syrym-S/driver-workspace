import { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';

import { getMyTrips } from './MyTrips/api';
import TripsList from './MyTrips/components/TripsList';

const MyTrips = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  const fetchTrips = async (pageValue = page) => {
    try {
      setLoading(true);
      setError(null);

      const res = await getMyTrips({
        page: pageValue,
        per_page: 10,
      });

      setData(res);
    } catch (err) {
      setError(err?.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips(page);
  }, [page]);

  return (
    <Box p={3}>
      <Typography variant="h5" mb={2}>
        Мои поездки
      </Typography>

      {loading && <CircularProgress />}

      {error && (
        <Alert severity="error">
          {JSON.stringify(error)}
        </Alert>
      )}

      {!loading && !error && data && (
        <TripsList
          data={data}
          page={page}
          onChangePage={setPage}
        />
      )}
    </Box>
  );
};

export default MyTrips;