import { describe, expect, it } from "vitest";
import {
  filtrarFilas,
  normalizarTexto,
  numerarPosicoes,
  obterFilasMock,
} from "./fila";

describe("services/fila", () => {
  it("numera posições a partir de 1 mantendo valores padrão", () => {
    const resultado = numerarPosicoes([
      { id: "1", nome: "Maria" },
      { id: "2", nome: "João", chegada: "09:15", prioridade: "Preferencial" },
    ]);

    expect(resultado).toEqual([
      { id: "1", nome: "Maria", posicao: 1, chegada: "08:00", prioridade: "Normal" },
      { id: "2", nome: "João", posicao: 2, chegada: "09:15", prioridade: "Preferencial" },
    ]);
  });

  it("normaliza texto removendo acentos e convertendo para minúsculas", () => {
    expect(normalizarTexto("Antônio José")).toBe("antonio jose");
  });

  it("retorna cópias independentes em obterFilasMock", () => {
    const a = obterFilasMock();
    const b = obterFilasMock();
    expect(a).not.toBe(b);
    expect(a.length).toBeGreaterThan(0);
    expect(a[0].pacientes[0].posicao).toBe(1);
  });

  it("filtra filas por profissional, especialidade, paciente (sem acento) e chamada ativa", () => {
    const filas = obterFilasMock();

    expect(filtrarFilas(filas, "   ")).toBe(filas);

    const porProfissional = filtrarFilas(filas, "clínico geral");
    expect(porProfissional).toHaveLength(1);
    expect(porProfissional[0].profissional.nome).toContain("Ricardo Mendes");
    expect(porProfissional[0].pacientes.length).toBeGreaterThan(1);

    const porPaciente = filtrarFilas(filas, "antonio");
    expect(porPaciente.length).toBeGreaterThanOrEqual(1);
    expect(
      porPaciente.every((f) =>
        f.pacientes.some((p) => normalizarTexto(p.nome).includes("antonio")),
      ),
    ).toBe(true);

    const porChamada = filtrarFilas(filas, "Beatriz");
    expect(porChamada).toHaveLength(1);
    expect(porChamada[0].emChamada?.paciente.nome).toContain("Beatriz");

    expect(filtrarFilas(filas, "inexistente-xyz")).toEqual([]);
  });
});
