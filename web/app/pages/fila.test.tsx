import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import Fila, { meta } from "./fila";

describe("pages/fila", () => {
  it("renderiza fila, busca paciente e executa ações da fila", () => {
    expect(meta({} as never)[0]).toEqual({ title: "Saúde Digital - Fila" });

    render(
      <MemoryRouter>
        <Fila />
      </MemoryRouter>,
    );

    expect(screen.getAllByText("Beatriz Souza Oliveira").length).toBeGreaterThanOrEqual(1);

    // Iniciar, chamar novamente e finalizar atendimento ativo
    fireEvent.click(screen.getByRole("button", { name: /Chamar novamente/i }));
    fireEvent.click(screen.getByRole("button", { name: /Iniciar atendimento/i }));
    expect(screen.getByRole("status")).toHaveTextContent("Atendimento de Beatriz Souza Oliveira iniciado.");

    fireEvent.click(screen.getByRole("button", { name: /Finalizar atendimento/i }));
    expect(screen.getByRole("status")).toHaveTextContent("Atendimento de Beatriz Souza Oliveira finalizado.");

    // Chamar próximo paciente da fila
    fireEvent.click(screen.getByRole("button", { name: /Chamar próximo/i }));

    // Pausar e retomar fila
    fireEvent.click(screen.getByRole("button", { name: /Pausar fila/i }));
    fireEvent.click(screen.getByRole("button", { name: /Retomar fila/i }));

    // Subir posição e remover paciente
    const botoesSubir = screen.getAllByRole("button", { name: /Subir posição de/i });
    if (botoesSubir[1]) fireEvent.click(botoesSubir[1]);

    const botoesRemover = screen.getAllByRole("button", { name: /Remover .* da fila/i });
    fireEvent.click(botoesRemover[0]);
    fireEvent.click(screen.getByRole("button", { name: "Remover paciente" }));
    expect(screen.getByRole("status")).toHaveTextContent("removido da fila.");

    // Busca
    const campoBusca = screen.getByPlaceholderText("Buscar fila por médico ou paciente");
    fireEvent.change(campoBusca, { target: { value: "inexistente" } });
    expect(screen.getByText(/Nenhum/i)).toBeInTheDocument();
  });
});
