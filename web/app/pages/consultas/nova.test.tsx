import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import NovaConsulta, { meta } from "./nova";

describe("pages/consultas/nova", () => {
  it("retorna metadados e consulta CEP com sucesso e erro", async () => {
    expect(meta({} as never)[0]).toEqual({ title: "Saúde Digital - Nova consulta" });

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            logradouro: "Rua Nova",
            bairro: "Centro",
            localidade: "Quixeramobim",
            uf: "CE",
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(new Response(JSON.stringify({ erro: true }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    render(
      <MemoryRouter>
        <NovaConsulta />
      </MemoryRouter>,
    );

    const botaoBuscar = screen.getByRole("button", { name: "Buscar" });
    expect(botaoBuscar).toBeDisabled();

    fireEvent.change(screen.getByLabelText("CEP"), { target: { value: "63800000" } });
    expect(botaoBuscar).toBeEnabled();
    fireEvent.click(botaoBuscar);

    await waitFor(() => {
      expect(screen.getByLabelText("Endereço Residencial")).toHaveValue(
        "Rua Nova, Centro, Quixeramobim - CE",
      );
    });

    fireEvent.click(botaoBuscar);
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("CEP não encontrado.");
    });
  });

  it("permite preencher paciente e consulta e cadastrar", async () => {
    render(
      <MemoryRouter>
        <NovaConsulta />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText("Nome Completo"), {
      target: { value: "Maria da Silva" },
    });
    fireEvent.change(screen.getByLabelText("CPF"), {
      target: { value: "12345678901" },
    });
    fireEvent.change(screen.getByLabelText("Cartão do SUS"), {
      target: { value: "700001234567890" },
    });
    fireEvent.change(screen.getByLabelText("Telefone com DDD"), {
      target: { value: "88999887766" },
    });
    fireEvent.change(screen.getByLabelText("Data de Nascimento"), {
      target: { value: "1990-05-10" },
    });
    fireEvent.change(screen.getByLabelText("CEP"), {
      target: { value: "63800000" },
    });
    fireEvent.change(screen.getByLabelText("Endereço Residencial"), {
      target: { value: "Rua A, 10" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Informações da Consulta/ }));
    fireEvent.change(screen.getByLabelText("Tipo de Consulta"), {
      target: { value: "Clínico geral" },
    });
    fireEvent.change(screen.getByLabelText("Médico"), {
      target: { value: "ricardo-mendes" },
    });
    fireEvent.change(screen.getByLabelText("Data"), {
      target: { value: "2026-11-25" },
    });
    fireEvent.change(screen.getByLabelText("Horário"), {
      target: { value: "09:30" },
    });
    fireEvent.change(screen.getByLabelText("Prioridade"), {
      target: { value: "Normal" },
    });

    const botaoCadastrar = screen.getByRole("button", { name: /Cadastrar/i });
    expect(botaoCadastrar).toBeEnabled();
    fireEvent.click(botaoCadastrar);

    await waitFor(() => {
      expect(screen.getByRole("status")).toBeInTheDocument();
    });
  });
});
