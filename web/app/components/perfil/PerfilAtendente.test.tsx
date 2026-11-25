import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PerfilAtendente } from "./PerfilAtendente";

describe("components/perfil/PerfilAtendente", () => {
  it("edita dados de contato, salva com onSalvar e exibe aviso de sucesso", () => {
    const onSalvar = vi.fn();
    const onAlterarSenha = vi.fn();

    render(<PerfilAtendente onSalvar={onSalvar} onAlterarSenha={onAlterarSenha} />);

    fireEvent.change(screen.getByLabelText("Nome completo"), {
      target: { value: "Mariana Silva" },
    });
    fireEvent.change(screen.getByLabelText("Nome social (opcional)"), {
      target: { value: "Mari" },
    });
    fireEvent.change(screen.getByLabelText("E-mail"), {
      target: { value: "mari@ubs.gov.br" },
    });
    fireEvent.change(screen.getByLabelText("Telefone com DDD"), {
      target: { value: "88999998888" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Salvar/i }));
    expect(onSalvar).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("status")).toBeInTheDocument();

    const botaoSenha = screen.queryByRole("button", { name: /Alterar senha/i });
    if (botaoSenha) {
      fireEvent.click(botaoSenha);
      expect(onAlterarSenha).toHaveBeenCalledTimes(1);
    }
  });
});
