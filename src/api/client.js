import axios from 'axios';

const baseURL = 'https://driver.360logistics.kz/wp-json/';

const nonce = window?.APP_DATA?.nonce || '';

export const api = axios.create({
   baseURL,
   headers: {
      'Content-Type': 'application/json',
      ...(nonce && { 'X-WP-Nonce': nonce }),
   },
});
