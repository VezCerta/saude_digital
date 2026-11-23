import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./Button";

describe("components/Button", () => {
  it("renderiza o texto e dispara onClick", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Salvar</Button>);

    const botao = screen.getByRole("button", { name: "Salvar" });
    expect(botao).toHaveAttribute("type", "button");

    fireEvent.click(botao);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("respeita disabled e variantes", () => {
    render(
      <Button variant="danger" disabled>
        Remover
      </Button>,
    );

    const botao = screen.getByRole("button", { name: "Remover" });
    expect(botao).toBeDisabled();
    expect(botao.className).toContain("bg-red-600");
  });
});
