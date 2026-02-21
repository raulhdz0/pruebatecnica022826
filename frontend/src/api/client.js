const BASE_URL = import.meta.env.VITE_API_URL;

const handleResponse = async (res) => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Error en la solicitud");
    return data;
};

export const getUsers = () =>
    fetch(`${BASE_URL}/users`).then(handleResponse);

export const createUser = (payload) =>
    fetch(`${BASE_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    }).then(handleResponse);

export const createTransfer = (payload) =>
    fetch(`${BASE_URL}/transfers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    }).then(handleResponse);
    