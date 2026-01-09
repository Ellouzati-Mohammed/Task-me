import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json"
  }
});

// Intercepteur pour ajouter automatiquement le token à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse (token expiré)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si le token est expiré ou invalide (401)
    if (error.response && error.response.status === 401) {
      // Nettoyer le localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Rediriger vers la page de login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
