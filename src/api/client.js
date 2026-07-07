import axios from "axios";

export const isStaging = window?.APP_DATA?.mode === "staging";

const baseURL =
  window?.APP_DATA?.rest_url ??
  "https://driver.360logistics.kz/staging/wp-json/";

const nonce = window?.APP_DATA?.nonce || "";

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    ...(nonce && { "X-WP-Nonce": nonce }),
  },
});
