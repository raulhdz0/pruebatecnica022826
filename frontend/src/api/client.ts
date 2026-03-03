import { buildHmacHeaders } from "../helpers/hmac";

const BASE_URL = import.meta.env.VITE_API_URL as string;

interface User {
  id: string;
  name: string;
  email: string;
}

interface Wallet {
  id: string;
  user_id: string;
  balance: number;
}

interface UserWithWallet extends User {
  Wallet: Wallet;
}

interface CreateUserPayload {
  name: string;
  email: string;
  balance?: number;
}

interface Transfer {
  id: string;
  from_user_id: string;
  to_user_id: string;
  amount: number;
  idempotency_key: string;
}

interface CreateTransferPayload {
  from_user_id: string;
  to_user_id: string;
  amount: number;
  idempotency_key: string;
}

const handleResponse = async <T>(res: Response): Promise<T> => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Error en la solicitud");
  return data as T;
};

export const getUsers = async (): Promise<UserWithWallet[]> => {
  const url = "/api/users";
  const headers = await buildHmacHeaders("GET", url, "");
  const res = await fetch(`${BASE_URL}/users`, { headers });
  return handleResponse<UserWithWallet[]>(res);
};

export const createUser = async (payload: CreateUserPayload): Promise<{ user: User; wallet: Wallet }> => {
  const url = "/api/users";
  const body = JSON.stringify(payload);
  const headers = await buildHmacHeaders("POST", url, body);
  const res = await fetch(`${BASE_URL}/users`, {
    method: "POST",
    headers,
    body,
  });
  return handleResponse<{ user: User; wallet: Wallet }>(res);
};

export const createTransfer = async (payload: CreateTransferPayload): Promise<{ message: string; transfer: Transfer }> => {
  const url = "/api/transfers";
  const { idempotency_key, ...bodyPayload } = payload;
  const body = JSON.stringify(bodyPayload);
  const headers = await buildHmacHeaders("POST", url, body);
  const res = await fetch(`${BASE_URL}/transfers`, {
    method: "POST",
    headers: {
      ...headers,
      "idempotency-key": idempotency_key,
    },
    body,
  });
  return handleResponse<{ message: string; transfer: Transfer }>(res);
};
