import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import Saidas, { meta } from "./saidas";

describe("pages/saidas", () => {
  it("retorna meta e permite aceitar solicitação de saída", () => {
    expect(meta({} as never)[0]).toEqual({ title: "Saúde Digital - Solicitações de saída" });

    render(
      <MemoryRouter>
        <Saidas />
      </MemoryRouter>,
    );

    expect(screen.getByText("Ana Souza Matias")).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: /Aceitar solicitação de saída de Ana Souza Matias/ }),
    );

    expect(screen.queryByText("Ana Souza Matias")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Pedido de saída aceito.");
  });
});
