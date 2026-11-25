import { describe, expect, it } from "vitest";
import { cn, formatCurrency, formatDate } from "./index";

describe("utils/index", () => {
  it("combina apenas classes truthy em cn", () => {
    const condicaoFalsa = false as boolean;
    expect(cn("a", undefined, null, condicaoFalsa && "b", "c")).toBe("a c");
  });

  it("formata valores em reais (BRL)", () => {
    expect(formatCurrency(1234.5)).toContain("1.234,50");
    expect(formatCurrency(1234.5)).toContain("R$");
  });

  it("formata datas no padrão brasileiro", () => {
    expect(formatDate(new Date(2026, 10, 23))).toBe("23/11/2026");
  });
});
