import api from "./client";

const toPaginated = (data, page = 1, pageSize = 8) => {
  if (Array.isArray(data)) {
    const total = data.length;
    return {
      items: data,
      meta: {
        page,
        page_size: pageSize,
        total,
        total_pages: Math.max(1, Math.ceil(total / pageSize)),
      },
    };
  }
  return data;
};

export const getOrders = async (params = {}) => {
  const response = await api.get("/orders", { params });
  return toPaginated(response.data, params.page, params.page_size);
};
export const updateOrderStatus = async (id, status) =>
  (await api.put(`/orders/${id}/status`, { status })).data;
