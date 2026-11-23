import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ModalConfirmacao } from "./ModalConfirmacao";

describe("components/ModalConfirmacao", () => {
  it("exibe título, descrição e aciona callbacks de confirmar e cancelar", () => {
    const onConfirmar = vi.fn();
    const onCancelar = vi.fn();

    render(
      <ModalConfirmacao
        aberto
        titulo="Remover paciente?"
        descricao="Essa ação cancela o atendimento."
        textoConfirmar="Sim, remover"
        textoCancelar="Voltar"
        onConfirmar={onConfirmar}
        onCancelar={onCancelar}
      />,
    );

    expect(screen.getByText("Remover paciente?")).toBeInTheDocument();
    expect(screen.getByText("Essa ação cancela o atendimento.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Voltar" }));
    expect(onCancelar).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Sim, remover" }));
    expect(onConfirmar).toHaveBeenCalledTimes(1);
  });
});
