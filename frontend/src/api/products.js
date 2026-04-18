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

export const getProducts = async (params = {}) => {
  const response = await api.get("/products", { params });
  return toPaginated(response.data, params.page, params.page_size);
};
export const getCategories = async () => (await api.get("/products/categories")).data;
export const createProduct = async (payload) => (await api.post("/products", payload)).data;
export const updateProduct = async (id, payload) => (await api.put(`/products/${id}`, payload)).data;
export const deleteProduct = async (id) => (await api.delete(`/products/${id}`)).data;
