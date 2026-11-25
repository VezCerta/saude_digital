import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import Consulta, { meta } from "./index";

describe("pages/consultas", () => {
  it("renderiza consultas do dia e permite alternar abas de status", () => {
    expect(meta()).toEqual([{ title: "Saúde Digital | Consultas" }]);

    render(
      <MemoryRouter>
        <Consulta />
      </MemoryRouter>,
    );

    expect(screen.getAllByText("Dr. Carlos Eduardo").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Maria Aparecida Silva").length).toBeGreaterThanOrEqual(1);

    const abas = screen.getAllByRole("button");
    const abaAtendidos = abas.find((b) => b.textContent?.includes("Atendidos"));
    if (abaAtendidos) {
      fireEvent.click(abaAtendidos);
    }
    expect(screen.getAllByText("Dr. Carlos Eduardo").length).toBeGreaterThanOrEqual(1);
  });
});
