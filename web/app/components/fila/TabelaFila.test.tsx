import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TabelaFila } from "./TabelaFila";

describe("components/fila/TabelaFila", () => {
  const pacientes = [
    { id: "1", nome: "João Silva", posicao: 1, chegada: "08:00", prioridade: "Normal" },
    { id: "2", nome: "Maria Clara", posicao: 2, chegada: "08:15", prioridade: "Idoso 60+" },
  ];

  it("exibe mensagemVazia quando lista está vazia", () => {
    render(<TabelaFila pacientes={[]} mensagemVazia="Fila vazia" onRemover={vi.fn()} />);
    expect(screen.getByText("Fila vazia")).toBeInTheDocument();
  });

  it("renderiza pacientes e aciona callbacks de chamar, subir e remover", () => {
    const onChamar = vi.fn();
    const onSubirPosicao = vi.fn();
    const onRemover = vi.fn();

    render(
      <TabelaFila
        pacientes={pacientes}
        onChamar={onChamar}
        onSubirPosicao={onSubirPosicao}
        onRemover={onRemover}
      />,
    );

    expect(screen.getByText("1º")).toBeInTheDocument();
    expect(screen.getByText("João Silva")).toBeInTheDocument();
    expect(screen.getByText("Idoso 60+")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Chamar João Silva" }));
    expect(onChamar).toHaveBeenCalledWith(pacientes[0]);

    fireEvent.click(screen.getByRole("button", { name: "Subir posição de Maria Clara" }));
    expect(onSubirPosicao).toHaveBeenCalledWith(pacientes[1]);

    fireEvent.click(screen.getByRole("button", { name: "Remover João Silva da fila" }));
    expect(onRemover).toHaveBeenCalledWith(pacientes[0]);
  });

  it("desabilita botão Chamar quando filaPausada é true", () => {
    render(<TabelaFila pacientes={pacientes} filaPausada onRemover={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Chamar João Silva" })).toBeDisabled();
  });
});
