import api from "./client";

export const getAnalyticsSummary = async () => (await api.get("/analytics/summary")).data;
