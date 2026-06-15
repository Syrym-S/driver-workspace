import { api } from '../../../api/client';

export const generateRoute = async (payload) => {
  const response = await api.post('/routing/v4/generate', payload);

  return response.data;
};

export const getDocuments = async ({ lead_id }) => {
  const response = await api.get('/document/v1/get', {
    params: {
      lead_id,
    },
  });

  return response.data;
};

export const getLeadInfo = async ({ lead_id }) => {
  const response = await api.get('/lead/v2/get', {
    params: {
      lead_id,
    },
  });

  return response.data;
};

// export const getActiveLead = async({lead_id}) => {
//   const response = await api.get('/lead/v/get_accepted', {
//     params: {
//       lead_id,
//     },
//   });

//   return response.data;
// }

export const getActiveLead = async() => {
  const response = await api.get('/lead/v1/get_accepted');

  return response.data;
}

export const acceptLead = async ({ lead_id }) => {
  const response = await api.post(
    '/lead/v1/accept',
    {
      lead_id: lead_id,
    }
  );

  return response.data;
};

export const startLead = async ({ lead_id }) => {
  const response = await api.post(
    '/lead/v1/start',
    {
      lead_id: lead_id,
    }
  );

  return response.data;
};