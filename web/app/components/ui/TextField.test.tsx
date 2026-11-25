import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TextField } from "./TextField";

describe("components/TextField", () => {
  it("associa label ao input e exibe trailing e labelAside", () => {
    render(
      <TextField
        id="email"
        label="E-mail"
        placeholder="seu@email.com"
        labelAside={<a href="#recuperar">Esqueci minha senha</a>}
        trailing={<button type="button">Limpar</button>}
      />,
    );

    expect(screen.getByLabelText("E-mail")).toHaveAttribute("placeholder", "seu@email.com");
    expect(screen.getByText("Esqueci minha senha")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Limpar" })).toBeInTheDocument();
  });

  it("marca aria-invalid e exibe mensagem de erro quando error é informado", () => {
    render(<TextField id="senha" label="Senha" error="Informe sua senha." />);

    const input = screen.getByLabelText("Senha");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", "senha-error");
    expect(screen.getByText("Informe sua senha.")).toHaveAttribute("id", "senha-error");
  });
});
