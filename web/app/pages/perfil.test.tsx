import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import Perfil from "./perfil";

describe("pages/perfil", () => {
  it("renderiza a página de perfil dentro do MainLayout", () => {
    render(
      <MemoryRouter>
        <Perfil />
      </MemoryRouter>,
    );

    expect(screen.getAllByText("Meu perfil").length).toBeGreaterThanOrEqual(2);
  });
});
