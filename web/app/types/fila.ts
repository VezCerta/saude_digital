export interface Profissional {
  id: string;
  nome: string;
  especialidade: string;
  consultorio?: string;
}

export interface PacienteNaFila {
  id: string;
  nome: string;
  /** Posição real na fila do profissional, começando em 1. */
  posicao: number;
  /** Horário de chegada na recepção (ex: "08:12"). */
  chegada: string;
  /** Prioridade de atendimento (ex: "Normal", "Idoso 60+", "Gestante"). */
  prioridade: string;
}

export interface ChamadaAtiva {
  paciente: PacienteNaFila;
  horarioChamada: string;
  consultorio: string;
  /** Quando true, o paciente já entrou no consultório ("EM ATENDIMENTO"). */
  emAtendimento?: boolean;
}

export interface FilaProfissional {
  profissional: Profissional;
  pausada?: boolean;
  emChamada?: ChamadaAtiva | null;
  pacientes: PacienteNaFila[];
}
