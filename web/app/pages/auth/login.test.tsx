import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import Login, { meta } from "./login";

describe("pages/auth/login", () => {
  it("retorna meta título", () => {
    expect(meta()).toEqual([{ title: "Saúde Digital | Login" }]);
  });

  it("valida campos obrigatórios, formato de e-mail e tamanho mínimo da senha", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));
    expect(screen.getByText("Informe seu e-mail.")).toBeInTheDocument();
    expect(screen.getByText("Informe sua senha.")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("E-mail"), { target: { value: "invalido" } });
    fireEvent.change(screen.getByLabelText("Senha"), { target: { value: "123" } });
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    expect(screen.getByText("Digite um e-mail válido.")).toBeInTheDocument();
    expect(screen.getByText("A senha deve ter pelo menos 6 caracteres.")).toBeInTheDocument();
  });

  it("alterna visibilidade da senha e envia formulário válido", async () => {
    vi.useFakeTimers();
    const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    const senha = screen.getByLabelText("Senha");
    expect(senha).toHaveAttribute("type", "password");
    fireEvent.click(screen.getByRole("button", { name: "Mostrar senha" }));
    expect(senha).toHaveAttribute("type", "text");

    fireEvent.change(screen.getByLabelText("E-mail"), {
      target: { value: "atendente@ubs.gov.br" },
    });
    fireEvent.change(senha, { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    await vi.runAllTimersAsync();
    expect(alertMock).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});
