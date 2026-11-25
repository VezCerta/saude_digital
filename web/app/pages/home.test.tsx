import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import Home, { meta } from "./home";

describe("pages/home", () => {
  it("renderiza página inicial e metadados", () => {
    expect(meta({} as never)[0]).toEqual({ title: "Trabalho ES - Início" });

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    expect(screen.getByText("Bem-vindo ao Trabalho ES")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Começar Agora" })).toBeInTheDocument();
  });
});
