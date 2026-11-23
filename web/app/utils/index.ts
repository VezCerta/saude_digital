/**
 * Funções utilitárias puras e helpers reutilizáveis.
 */

/**
 * Combina classes CSS condicionalmente.
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export * from "./formatacao";
export * from "./mascaras";
