import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { AvisoSucesso } from "./AvisoSucesso";
import { Breadcrumb } from "./Breadcrumb";
import { CampoSelect } from "./CampoSelect";
import { CampoTexto } from "./CampoTexto";
import { Card } from "./Card";
import { SecaoRecolhivel } from "./SecaoRecolhivel";

describe("components/ui", () => {
  it("AvisoSucesso renderiza apenas quando visivel é true", () => {
    const { rerender } = render(<AvisoSucesso visivel={false} mensagem="Salvo!" />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    rerender(<AvisoSucesso visivel mensagem="Salvo!" />);
    expect(screen.getByRole("status")).toHaveTextContent("Salvo!");
  });

  it("Breadcrumb renderiza links intermediários e texto no último item", () => {
    render(
      <MemoryRouter>
        <Breadcrumb
          itens={[
            { rotulo: "Consultas", para: "/consulta" },
            { rotulo: "Nova consulta", para: "/consulta/nova" },
          ]}
        />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "Consultas" })).toHaveAttribute("href", "/consulta");
    const ultimo = screen.getByText("Nova consulta");
    expect(ultimo.tagName).toBe("SPAN");
    expect(ultimo).toHaveAttribute("aria-current", "page");
  });

  it("CampoSelect e CampoTexto associam rótulos e disparam onChange", () => {
    const onSelect = vi.fn();
    const onTexto = vi.fn();

    render(
      <>
        <CampoSelect
          rotulo="Prioridade"
          placeholder="Selecione"
          value=""
          onChange={onSelect}
          opcoes={[
            { valor: "normal", rotulo: "Normal" },
            { valor: "pref", rotulo: "Preferencial" },
          ]}
        />
        <CampoTexto rotulo="Nome" placeholder="Digite" value="" onChange={onTexto} />
      </>,
    );

    fireEvent.change(screen.getByLabelText("Prioridade"), { target: { value: "normal" } });
    expect(onSelect).toHaveBeenCalledTimes(1);

    fireEvent.change(screen.getByLabelText("Nome"), { target: { value: "Maria" } });
    expect(onTexto).toHaveBeenCalledTimes(1);
  });

  it("Card renderiza título, descrição e conteúdo", () => {
    render(
      <Card title="Título Card" description="Descrição Card">
        <span>Conteúdo interno</span>
      </Card>,
    );

    expect(screen.getByText("Título Card")).toBeInTheDocument();
    expect(screen.getByText("Descrição Card")).toBeInTheDocument();
    expect(screen.getByText("Conteúdo interno")).toBeInTheDocument();
  });

  it("SecaoRecolhivel alterna visibilidade e exibe textoAjuda", () => {
    const onAlternar = vi.fn();
    const { rerender } = render(
      <SecaoRecolhivel
        titulo="Dados pessoais"
        descricao="Preencha os campos"
        aberta={false}
        onAlternar={onAlternar}
        textoAjuda="Ajuda importante"
      >
        <p>Corpo da seção</p>
      </SecaoRecolhivel>,
    );

    const botao = screen.getByRole("button", { name: /Dados pessoais/ });
    expect(botao).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText("Ajuda importante")).toBeInTheDocument();

    fireEvent.click(botao);
    expect(onAlternar).toHaveBeenCalledTimes(1);

    rerender(
      <SecaoRecolhivel
        titulo="Dados pessoais"
        descricao="Preencha os campos"
        aberta
        onAlternar={onAlternar}
      >
        <p>Corpo da seção</p>
      </SecaoRecolhivel>,
    );
    expect(screen.getByText("Corpo da seção")).toBeVisible();
  });
});
