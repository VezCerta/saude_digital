export interface SolicitacaoSaida {
  id: string;
  nome: string;
  cpf: string;
  /** Horário em que o paciente pediu a saída, no formato hh:mm. */
  horario: string;
  /** Mesmo id usado em `Profissional` (types/fila.ts). */
  profissionalId: string;
}
