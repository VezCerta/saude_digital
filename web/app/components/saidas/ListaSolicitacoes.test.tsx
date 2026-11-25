import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ListaSolicitacoes } from "./ListaSolicitacoes";

describe("components/saidas/ListaSolicitacoes", () => {
  it("exibe mensagem vazia quando não há solicitações", () => {
    render(<ListaSolicitacoes solicitacoes={[]} onAceitar={vi.fn()} />);
    expect(screen.getByText("Não há solicitações.")).toBeInTheDocument();
  });

  it("renderiza solicitações e dispara onAceitar ao clicar", () => {
    const onAceitar = vi.fn();
    const item = {
      id: "s-1",
      nome: "Ana Souza",
      cpf: "123.456.789-00",
      horario: "14:20",
      profissionalId: "p-1",
    };

    render(<ListaSolicitacoes solicitacoes={[item]} onAceitar={onAceitar} />);

    expect(screen.getByText("Ana Souza")).toBeInTheDocument();
    expect(screen.getByText("CPF: 123.456.789-00")).toBeInTheDocument();
    expect(screen.getByText("14:20")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Aceitar solicitação de saída de Ana Souza/ }));
    expect(onAceitar).toHaveBeenCalledWith(item);
  });
});
