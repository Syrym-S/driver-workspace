import { api } from "../../api/client";

export const getUser = async() => {
  const response = await api.get('/profile/v1/get');

  return response.data;
}

export const insertInvite = async ({ invite }) => {
  const response = await api.post(
    '/profile/v1/invite',
    {
      invite:invite,
    }
  );

  return response.data;
};

export const updateuser = async ({ params }) => {
  const response = await api.post(
    '/profile/v1/update',
    params
  );

  return response.data;
};