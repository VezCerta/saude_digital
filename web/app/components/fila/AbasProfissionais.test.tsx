import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AbasProfissionais } from "./AbasProfissionais";

describe("components/fila/AbasProfissionais", () => {
  it("renderiza abas, marca a ativa e chama onSelecionar", () => {
    const onSelecionar = vi.fn();
    const profissionais = [
      { id: "p1", nome: "Dr. Ricardo", especialidade: "Clínico geral" },
      { id: "p2", nome: "Dra. Ana", especialidade: "Pediatria" },
    ];

    render(
      <AbasProfissionais
        profissionais={profissionais}
        ativoId="p1"
        onSelecionar={onSelecionar}
      />,
    );

    const aba1 = screen.getByRole("tab", { name: /Dr\. Ricardo/ });
    const aba2 = screen.getByRole("tab", { name: /Dra\. Ana/ });

    expect(aba1).toHaveAttribute("aria-selected", "true");
    expect(aba2).toHaveAttribute("aria-selected", "false");

    fireEvent.click(aba2);
    expect(onSelecionar).toHaveBeenCalledWith("p2");
  });
});
