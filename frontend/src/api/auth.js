import api from "./client";

export const login = async (payload) => (await api.post("/auth/login", payload)).data;
export const register = async (payload) => (await api.post("/auth/register", payload)).data;
export const me = async () => (await api.get("/auth/me")).data;
