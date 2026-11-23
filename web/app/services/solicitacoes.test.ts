import { describe, expect, it } from "vitest";
import { obterSolicitacoesMock, solicitacoesDoProfissional } from "./solicitacoes";

describe("services/solicitacoes", () => {
  it("filtra solicitações por profissional e ordena por horário crescente", () => {
    const lista = [
      {
        id: "1",
        nome: "Carlos",
        cpf: "111.111.111-11",
        horario: "16:00",
        profissionalId: "p1",
      },
      {
        id: "2",
        nome: "Ana",
        cpf: "222.222.222-22",
        horario: "09:30",
        profissionalId: "p1",
      },
      {
        id: "3",
        nome: "Bruno",
        cpf: "333.333.333-33",
        horario: "08:00",
        profissionalId: "p2",
      },
    ];

    expect(solicitacoesDoProfissional(lista, "p1").map((s) => s.id)).toEqual(["2", "1"]);
    expect(obterSolicitacoesMock().length).toBeGreaterThan(0);
  });
});
