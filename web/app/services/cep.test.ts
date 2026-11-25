import { describe, expect, it, vi } from "vitest";
import { buscarEnderecoPorCep, formatarEndereco } from "./cep";

describe("services/cep", () => {
  it("retorna null sem chamar fetch quando o CEP não tem 8 dígitos", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    expect(await buscarEnderecoPorCep("63800")).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("retorna endereço formatado quando ViaCEP encontra o CEP", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          logradouro: "Rua Central",
          bairro: "Centro",
          localidade: "Quixeramobim",
          uf: "CE",
        }),
        { status: 200 },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const endereco = await buscarEnderecoPorCep("63800-000");

    expect(fetchMock).toHaveBeenCalledWith("https://viacep.com.br/ws/63800000/json/");
    expect(endereco).toEqual({
      logradouro: "Rua Central",
      bairro: "Centro",
      cidade: "Quixeramobim",
      uf: "CE",
    });
  });

  it("retorna null quando ViaCEP responde erro: true e lança em falha HTTP", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ erro: true }), { status: 200 })),
    );
    expect(await buscarEnderecoPorCep("00000000")).toBeNull();

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("Erro", { status: 503 })),
    );
    await expect(buscarEnderecoPorCep("63800000")).rejects.toThrow("Falha ao consultar o CEP.");
  });

  it("formata endereço omitindo partes vazias", () => {
    expect(
      formatarEndereco({
        logradouro: "Rua A",
        bairro: "Centro",
        cidade: "Quixeramobim",
        uf: "CE",
      }),
    ).toBe("Rua A, Centro, Quixeramobim - CE");

    expect(
      formatarEndereco({
        logradouro: "",
        bairro: "",
        cidade: "Quixeramobim",
        uf: "CE",
      }),
    ).toBe("Quixeramobim - CE");
  });
});
