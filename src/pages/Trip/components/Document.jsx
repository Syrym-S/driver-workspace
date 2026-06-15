import { useEffect, useState } from 'react';

import {
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Box,
  ButtonBase,
  Stack,
} from '@mui/material';

import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';

import { getDocuments } from '../api/api';

const Document = ({ tripId }) => {
  const [documents, setDocuments] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(false);

      const res = await getDocuments({
        lead_id: tripId,
      });

      setDocuments(res?.results || []);

    } catch (e) {
      console.error(e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tripId) {
      fetchDocuments();
    }
  }, [tripId]);

  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 4,
      }}
    >
      {/* TITLE */}
      <Typography
        variant="h6"
        fontWeight={700}
        mb={3}
      >
        Документы
      </Typography>

      {/* LOADING */}
      {loading && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight={220}
        >
          <CircularProgress />
        </Box>
      )}

      {/* ERROR */}
      {!loading && error && (
        <Alert
          severity="warning"
          sx={{
            borderRadius: 3,
          }}
        >
          Сейчас документы временно недоступны.
          Попробуйте обновить страницу немного позже.
        </Alert>
      )}

      {/* EMPTY */}
      {!loading && !error && documents.length === 0 && (
        <Alert
          severity="info"
          sx={{
            borderRadius: 3,
          }}
        >
          Для текущего рейса документы пока не сформированы.
          Они появятся автоматически после обработки заявки.
        </Alert>
      )}

      {/* DOCUMENTS */}
      {!loading && !error && documents.length > 0 && (
        <Stack spacing={2}>
          {documents.map((doc, index) => (
            <ButtonBase
              key={index}
              onClick={() => window.open(doc.path, '_blank')}
              sx={{
                width: '100%',
                textAlign: 'left',
                borderRadius: 3,
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 3,

                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,

                  transition: '0.2s',

                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'action.hover',
                  },
                }}
              >
                {/* ICON */}
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: 2,
                    bgcolor: 'primary.main',
                    color: '#fff',

                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',

                    flexShrink: 0,
                  }}
                >
                  <InsertDriveFileOutlinedIcon />
                </Box>

                {/* CONTENT */}
                <Box
                  sx={{
                    minWidth: 0,
                  }}
                >
                  <Typography
                    fontWeight={600}
                    noWrap
                  >
                    {doc.name}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 0.5,
                    }}
                  >
                    {doc.context}
                  </Typography>
                </Box>
              </Box>
            </ButtonBase>
          ))}
        </Stack>
      )}
    </Paper>
  );
};

export default Document;