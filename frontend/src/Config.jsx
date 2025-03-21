import axios from "axios";
import { Cookies } from "react-cookie";

const base_api_url = "http://localhost:8000/api/v1"; // URL base del backend
const cookies = new Cookies(); // Instancia para manejar cookies

// Método para obtener el token desde las cookies
const getToken = () => {
  const token = cookies.get("token");
  if (!token) {
    console.error("Token no encontrado en las cookies.");
    return null;
  }
  return token;
};

// Configuración global de Axios con un interceptor
const axiosInstance = axios.create({
  baseURL: base_api_url,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Incluye cookies en las solicitudes
});

// Interceptor para agregar automáticamente el token en el encabezado Authorization
axiosInstance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
// Función para obtener la ruta correcta según el rol del usuario
const getCronometroEndpoint = () => {
  const userRole = cookies.get("role"); // 🔹 Obtener el rol desde la cookie
  return userRole === "pm" ? "/pm/cronometros" : "/admin/cronometros";
};


export default {
  importSows: (data) => axiosInstance.post("/admin/import/sows", data, {
    headers: {
        "Content-Type": "application/json",
    }
}),

  // Métodos de autenticación
  getLogin: (data) => axiosInstance.post("/auth/login", data),

  getLogout: () =>
    axiosInstance
      .post("/auth/logout")
      .then((response) => {
        console.log("Logout exitoso:", response.data);
        cookies.remove("user", { path: "/" });
        cookies.remove("token", { path: "/" });
        cookies.remove("role", { path: "/" });
        window.location.href = "/login";
      })
      .catch((error) => {
        console.error("Error al cerrar sesión:", error);
        throw error;
      }),

  sendRequest: async (data) => {
    try {
      console.log("data", data);
      const response = await axiosInstance.post("/password/reset-request", data);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw error.response.data;
      } else {
        throw error;
      }
    }
  },

  resetRequests: async () => {
    try {
      const response = await axiosInstance.get("/admin/reset-requests");
      return response.data;
    } catch (error) {
      console.error("Error al obtener las solicitudes de reseteo:", error);
    }
  },

  resetRequestsApprove: async (id, email, password) => {
    try {
      const response = await axiosInstance.post(
        `/admin/reset-requests/approve/${id}`,
        { email, password }
      );
      return response.data;
    } catch (error) {
      console.error("Error al aprobar reseteo:", error);
    }
  },

  resetRequestsCancel: async (data) => {
    try {
      const response = await axiosInstance.post("/admin/reset-requests/cancel", data);
      return response.data;
    } catch (error) {
      console.error("Error al cancelar reseteo:", error);
    }
  },

  // Métodos de usuarios
  getUserAll: async () => {
    try {
      const response = await axiosInstance.get("/admin/user");
      return response.data;
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      throw error;
    }
  },

  getUserById: async (id) => {
    try {
      const response = await axiosInstance.get(`/admin/user/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener usuario por ID:", error);
      throw error;
    }
  },

  getUserAllWithRoles: async () => {
    try {
      const response = await axiosInstance.get("/admin/user-roles");
      return response.data;
    } catch (error) {
      console.error("Error al obtener usuarios con roles:", error);
      throw error;
    }
  },

  getUserRol: async () => {
    try {
      const response = await axiosInstance.get("/admin/roles");
      console.log("Roles obtenidos:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error al obtener roles:", error);
      throw error;
    }
  },

  getUserCreate: (data) => axiosInstance.post("/admin/user/create", data),

  getUserUpdate: (data, id) => axiosInstance.put(`/admin/user/${id}`, data),

  getUserDeleteById: (id) => axiosInstance.delete(`/admin/user/${id}`),

  getUserCount: async () => {
    try {
      const response = await axiosInstance.get("/admin/userCount");
      return response.data;
    } catch (error) {
      console.error("Error al contar usuarios:", error);
      throw error;
    }
  },

  getUserTotal: async () => {
    try {
      const response = await axiosInstance.get("/admin/totalUsers");
      return response.data;
    } catch (error) {
      console.error("Error al obtener el total de usuarios:", error);
      throw error;
    }
  },

  // Métodos para SOW (Statements of Work)
  getSowAll: async (page = 1) => {
    try {
      const response = await axiosInstance.get(`/admin/sow?page=${page}`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener SOWs:", error);
      throw error;
    }
  },

  getAllSowsNoPaginate: async () => {
    try {
      const response = await axiosInstance.get("/admin/sow-all");
      return response.data;
    } catch (error) {
      console.error("Error al obtener todos los SOWs sin paginación:", error);
      throw error;
    }
  },

  getSowById: async (id) => {
    try {
      const response = await axiosInstance.get(`/admin/sow/${id}`);
      console.log("Respuesta directa de getSowById:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error al obtener SOW por ID:", error);
      throw error;
    }
  },

  getSowCreate: (data) => axiosInstance.post("/admin/sows/create", data),

  getSowUpdate: (data, id) => axiosInstance.put(`/admin/sow/${id}`, data),

  getSowDeleteById: (id) => axiosInstance.delete(`/admin/sow/${id}`),

  getSowCreateInfo: (ticket_sow) =>
    axiosInstance.get(`/admin/sows/${ticket_sow}/creator`),

  getSearchBar: (query) => axiosInstance.get(`/search/sows?query=${query}`),

  getEnum: (field) => axiosInstance.get(`/enums/${field}`),

  downloadSow: () =>
    axiosInstance.get("/export/xlsx", {
      responseType: "blob",
    }),

  getSowStatus: () => axiosInstance.get("/admin/sowStatus"),

  getSowCount: () => axiosInstance.get("/admin/totalSows"),

  // Métodos para cronómetros
  getCronometros: async (page = 1) => {
    try {
      const response = await axiosInstance.get(`/admin/cronometros?page=${page}`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener cronómetros:", error);
      throw error;
    }
  },

  getCronometroById: async (id) => {
    try {
      const response = await axiosInstance.get(`/admin/cronometros/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener cronómetro por ID:", error);
      throw error;
    }
  },

  createCronometro: (data) => axiosInstance.post(getCronometroEndpoint(), data),

  updateCronometro: (data, id) => axiosInstance.put(`${getCronometroEndpoint()}/${id}`, data),

  deleteCronometroById: (id) => axiosInstance.delete(`${getCronometroEndpoint()}/${id}`),

  getCronometroCreateInfo: (id) => axiosInstance.get(`${getCronometroEndpoint()}/${id}/creator`),

  updateCronometroTimer: (field, id, data) =>
    axiosInstance.put(`${getCronometroEndpoint()}/${id}/timer/${field}`, data),

  updateCronometroElapsedTime: async (id, data) => {
    if (!id || typeof id !== "number") {
      console.error("ID inválido en updateCronometroElapsedTime:", id);
      return;
    }

    try {
      console.log(`Actualizando elapsed_xxx para ID ${id}:`, data);
      const response = await axiosInstance.put(`${getCronometroEndpoint()}/${id}/elapsed-time`, data);
      return response.data;
    } catch (error) {
      console.error("Error al actualizar el tiempo transcurrido:", error);
      throw error;
    }
  },
};