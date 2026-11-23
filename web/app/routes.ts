import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  // 1. Página inicial (URL: "/")
  index("pages/home.tsx"),

  // 2. Autenticação
  route("login", "pages/auth/login.tsx"),

  // 3. Atendimento e gestão da UBS
  route("fila", "pages/fila.tsx"),
  route("consulta", "pages/consultas/index.tsx"),
  route("consulta/nova", "pages/consultas/nova.tsx"),
  route("saidas", "pages/saidas.tsx"),
  route("perfil", "pages/perfil.tsx"),
] satisfies RouteConfig;
