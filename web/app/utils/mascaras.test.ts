import { describe, expect, it } from "vitest";
import {
  apenasDigitos,
  mascararCartaoSus,
  mascararCep,
  mascararCpf,
  mascararTelefone,
} from "./mascaras";

describe("utils/mascaras", () => {
  it("remove caracteres não numéricos em apenasDigitos", () => {
    expect(apenasDigitos("123.456.789-00")).toBe("12345678900");
    expect(apenasDigitos("abc-12!3")).toBe("123");
  });

  it("aplica máscara de CPF progressivamente e ignora excedentes", () => {
    expect(mascararCpf("123")).toBe("123");
    expect(mascararCpf("1234")).toBe("123.4");
    expect(mascararCpf("12345678901999")).toBe("123.456.789-01");
  });

  it("aplica máscara de Cartão SUS (15 dígitos)", () => {
    expect(mascararCartaoSus("700001234567890")).toBe("700 0012 3456 7890");
    expect(mascararCartaoSus("7000")).toBe("700 0");
  });

  it("aplica máscara de telefone fixo (10 dígitos) e celular (11 dígitos)", () => {
    expect(mascararTelefone("8834411234")).toBe("(88) 3441-1234");
    expect(mascararTelefone("88999887766")).toBe("(88) 99988-7766");
  });

  it("aplica máscara de CEP", () => {
    expect(mascararCep("63800000")).toBe("63800-000");
    expect(mascararCep("63800")).toBe("63800");
  });
});
