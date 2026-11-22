import { API_URL } from "./config";

// Agrega el token de sesión a todas las peticiones que van al backend,
// sin tener que tocar cada fetch de las páginas.
// Si el backend responde 401 (sin token, o token vencido), se cierra la sesión
// y se manda al usuario al login.
const fetchOriginal = window.fetch.bind(window);

window.fetch = async (recurso, opciones = {}) => {
  const url = typeof recurso === "string" ? recurso : recurso.url;
  const esBackend = url.startsWith(API_URL);
  const esPublica = url.includes("/api/login") || url.includes("/api/registro");

  if (!esBackend || esPublica) {
    return fetchOriginal(recurso, opciones);
  }

  const token = localStorage.getItem("token");
  const encabezados = new Headers(opciones.headers || {});
  if (token) encabezados.set("Authorization", "Bearer " + token);

  const respuesta = await fetchOriginal(recurso, { ...opciones, headers: encabezados });

  if (respuesta.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  }

  return respuesta;
};
