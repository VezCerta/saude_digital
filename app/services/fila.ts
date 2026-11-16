/**
 * Dados provisórios (mock) da fila de atendimento.
 *
 * O backend (trabalho_ES_backend) ainda não expõe endpoints da fila. Quando
 * existirem, troque apenas a origem dos dados (hoje `obterFilasMock`) por
 * chamadas ao cliente de `~/services/api`; os tipos e as funções de filtro
 * continuam valendo.
 */

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

/** Quantidade de solicitações de saída pendentes (valor provisório). */
export const SOLICITACOES_PENDENTES_MOCK = 2;

interface PacienteBase {
  id: string;
  nome: string;
  chegada: string;
  prioridade: string;
}

interface FilaBase {
  profissional: Profissional;
  emChamada?: {
    paciente: PacienteBase;
    horarioChamada: string;
    consultorio: string;
  } | null;
  pacientes: PacienteBase[];
}

const filasBase: FilaBase[] = [
  {
    profissional: {
      id: "ricardo-mendes",
      nome: "Dr. Ricardo Mendes",
      especialidade: "Clínico geral",
      consultorio: "Consultório 2",
    },
    emChamada: {
      paciente: {
        id: "p-100",
        nome: "Beatriz Souza Oliveira",
        chegada: "08:05",
        prioridade: "Normal",
      },
      horarioChamada: "00:42",
      consultorio: "Consultório 2",
    },
    pacientes: [
      {
        id: "p-101",
        nome: "Carlos Roberto Pereira",
        chegada: "08:12",
        prioridade: "Idoso 60+",
      },
      {
        id: "p-102",
        nome: "Ana Lima",
        chegada: "08:20",
        prioridade: "Normal",
      },
      {
        id: "p-103",
        nome: "Guilherme Nunes",
        chegada: "08:25",
        prioridade: "Normal",
      },
      {
        id: "p-104",
        nome: "Mariana Costa",
        chegada: "08:32",
        prioridade: "Gestante",
      },
    ],
  },
  {
    profissional: {
      id: "luiza-freitas",
      nome: "Dra. Luiza Freitas",
      especialidade: "Dentista",
      consultorio: "Consultório 1",
    },
    emChamada: {
      paciente: {
        id: "p-200",
        nome: "Sabrina Oliveira",
        chegada: "07:55",
        prioridade: "Normal",
      },
      horarioChamada: "01:15",
      consultorio: "Consultório 1",
    },
    pacientes: [
      {
        id: "p-201",
        nome: "Antônio Carlos",
        chegada: "08:10",
        prioridade: "Idoso 60+",
      },
      {
        id: "p-202",
        nome: "Ricardo Felipe",
        chegada: "08:18",
        prioridade: "Normal",
      },
      {
        id: "p-203",
        nome: "Karla Santos de Oliveira",
        chegada: "08:30",
        prioridade: "Normal",
      },
      {
        id: "p-204",
        nome: "Maria Helena Marques",
        chegada: "08:40",
        prioridade: "Idoso 60+",
      },
    ],
  },
  {
    profissional: {
      id: "pedro-henrique",
      nome: "Dr. Pedro Henrique",
      especialidade: "Cardiologista",
      consultorio: "Consultório 3",
    },
    emChamada: null,
    pacientes: [
      {
        id: "p-301",
        nome: "Eduardo Lima",
        chegada: "08:05",
        prioridade: "Idoso 60+",
      },
      {
        id: "p-302",
        nome: "Helena Duarte",
        chegada: "08:15",
        prioridade: "Normal",
      },
      {
        id: "p-303",
        nome: "Marcos Vinícius Almeida",
        chegada: "08:22",
        prioridade: "Normal",
      },
      {
        id: "p-304",
        nome: "Teresa Cristina Barbosa",
        chegada: "08:35",
        prioridade: "Idoso 60+",
      },
      {
        id: "p-305",
        nome: "Paulo Sérgio Azevedo",
        chegada: "08:45",
        prioridade: "Normal",
      },
    ],
  },
  {
    profissional: {
      id: "juliana-silva",
      nome: "Dra. Juliana Silva",
      especialidade: "Nutricionista",
      consultorio: "Consultório 4",
    },
    emChamada: null,
    pacientes: [
      {
        id: "p-401",
        nome: "Camila Rocha",
        chegada: "08:14",
        prioridade: "Gestante",
      },
      {
        id: "p-402",
        nome: "André Luiz Ferreira",
        chegada: "08:28",
        prioridade: "Normal",
      },
      {
        id: "p-403",
        nome: "Renata Martins Costa",
        chegada: "08:50",
        prioridade: "Normal",
      },
    ],
  },
];

/** Numera os pacientes na ordem em que estão (1º, 2º, 3º...). */
export function numerarPosicoes(
  pacientes: {
    id: string;
    nome: string;
    chegada?: string;
    prioridade?: string;
  }[],
): PacienteNaFila[] {
  return pacientes.map((paciente, indice) => ({
    id: paciente.id,
    nome: paciente.nome,
    posicao: indice + 1,
    chegada: paciente.chegada ?? "08:00",
    prioridade: paciente.prioridade ?? "Normal",
  }));
}

/** Retorna uma cópia nova das filas de exemplo, já com as posições. */
export function obterFilasMock(): FilaProfissional[] {
  return filasBase.map((fila) => ({
    profissional: { ...fila.profissional },
    pausada: false,
    emChamada: fila.emChamada
      ? {
          paciente: {
            ...fila.emChamada.paciente,
            posicao: 0,
          },
          horarioChamada: fila.emChamada.horarioChamada,
          consultorio: fila.emChamada.consultorio,
        }
      : null,
    pacientes: numerarPosicoes(fila.pacientes),
  }));
}

/** Minúsculas e sem acentos, para a busca ignorar "Antônio" x "antonio". */
export function normalizarTexto(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/**
 * Filtra as filas pelo termo de busca.
 * - Se o nome ou a especialidade do profissional combina, a fila inteira aparece.
 * - Caso contrário, aparecem só os pacientes que combinam (com a posição real).
 * - Profissionais sem nenhuma correspondência ficam de fora.
 */
export function filtrarFilas(
  filas: FilaProfissional[],
  termo: string,
): FilaProfissional[] {
  const busca = normalizarTexto(termo.trim());
  if (!busca) return filas;

  return filas.flatMap((fila) => {
    const profissionalCombina = normalizarTexto(
      `${fila.profissional.nome} ${fila.profissional.especialidade}`,
    ).includes(busca);
    if (profissionalCombina) return [fila];

    const pacientes = fila.pacientes.filter((paciente) =>
      normalizarTexto(paciente.nome).includes(busca),
    );
    const chamadaCombina = fila.emChamada
      ? normalizarTexto(fila.emChamada.paciente.nome).includes(busca)
      : false;

    return pacientes.length > 0 || chamadaCombina
      ? [{ ...fila, pacientes }]
      : [];
  });
}
