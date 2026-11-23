import { describe, expect, it, vi } from "vitest";
import { ApiError, apiClient } from "./api";

describe("services/api", () => {
  it("faz requisição GET com Content-Type application/json e retorna JSON", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const resultado = await apiClient<{ ok: boolean }>("/fila");

    expect(resultado).toEqual({ ok: true });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/fila");
    expect((init.headers as Headers).get("Content-Type")).toBe("application/json");
  });

  it("não força Content-Type quando o corpo é FormData e aceita URL absoluta", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    const form = new FormData();
    form.append("arquivo", "conteudo");
    const resultado = await apiClient("https://exemplo.com/upload", {
      method: "POST",
      body: form,
    });

    expect(resultado).toEqual({});
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://exemplo.com/upload");
    expect((init.headers as Headers).has("Content-Type")).toBe(false);
  });

  it("lança ApiError com payload JSON ou texto quando a resposta falha", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ message: "Não autorizado" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    await expect(apiClient("/auth/me")).rejects.toMatchObject({
      name: "ApiError",
      status: 401,
      data: { message: "Não autorizado" },
    });

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("Erro interno", { status: 500 })),
    );

    await expect(apiClient("/auth/me")).rejects.toBeInstanceOf(ApiError);
  });
});
