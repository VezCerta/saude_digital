import { describe, expect, it } from "vitest";
import {
  CONSULTA_VAZIA,
  PACIENTE_VAZIO,
  consultaCompleta,
  listarEspecialidades,
  listarProfissionais,
  pacienteCompleto,
} from "./consultas";

describe("services/consultas", () => {
  it("lista especialidades únicas mantendo a ordem", () => {
    const especialidades = listarEspecialidades([
      { id: "1", nome: "Dr. A", especialidade: "Clínico geral" },
      { id: "2", nome: "Dra. B", especialidade: "Pediatria" },
      { id: "3", nome: "Dr. C", especialidade: "Clínico geral" },
    ]);

    expect(especialidades).toEqual(["Clínico geral", "Pediatria"]);
    expect(listarProfissionais().length).toBeGreaterThan(0);
  });

  it("valida preenchimento completo do paciente", () => {
    expect(pacienteCompleto(PACIENTE_VAZIO)).toBe(false);

    const valido = {
      nome: "Maria Silva",
      cpf: "123.456.789-01",
      cartaoSus: "700 0012 3456 7890",
      telefone: "(88) 99988-7766",
      dataNascimento: "1990-05-10",
      cep: "63800-000",
      endereco: "Rua Central, 10",
    };
    expect(pacienteCompleto(valido)).toBe(true);
    expect(pacienteCompleto({ ...valido, cpf: "123" })).toBe(false);
    expect(pacienteCompleto({ ...valido, telefone: "(88) 3441-1234" })).toBe(true);
  });

  it("valida preenchimento completo da consulta", () => {
    expect(consultaCompleta(CONSULTA_VAZIA)).toBe(false);
    expect(
      consultaCompleta({
        especialidade: "Clínico geral",
        profissionalId: "ricardo-mendes",
        data: "2026-11-23",
        horario: "09:00",
        prioridade: "Normal",
      }),
    ).toBe(true);
  });
});
