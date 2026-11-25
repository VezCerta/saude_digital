import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { AuthLayout } from "./AuthLayout";
import { MainLayout } from "./MainLayout";

describe("layouts", () => {
  it("AuthLayout renderiza cabeçalho, conteúdo principal e rodapé", () => {
    render(
      <MemoryRouter>
        <AuthLayout>
          <div>Formulário</div>
        </AuthLayout>
      </MemoryRouter>,
    );

    expect(screen.getByText("Saúde Digital")).toBeInTheDocument();
    expect(screen.getByText("Formulário")).toBeInTheDocument();
    expect(screen.getByText("Termos de Uso")).toBeInTheDocument();
  });

  it("MainLayout renderiza Navbar, HeaderBar, children e Footer", () => {
    render(
      <MemoryRouter initialEntries={["/fila"]}>
        <MainLayout>
          <div>Conteúdo principal</div>
        </MainLayout>
      </MemoryRouter>,
    );

    expect(screen.getByText("UBS Centro")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Fila" })).toHaveAttribute("href", "/fila");
    expect(screen.getByText("Conteúdo principal")).toBeInTheDocument();
    expect(screen.getByText(/Todos os direitos reservados/)).toBeInTheDocument();
  });
});
