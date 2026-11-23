export interface DadosPaciente {
  nome: string;
  cpf: string;
  cartaoSus: string;
  telefone: string;
  /** Formato do input de data: aaaa-mm-dd. */
  dataNascimento: string;
  cep: string;
  endereco: string;
}

export interface DadosConsulta {
  /** Tipo de consulta = especialidade do profissional. */
  especialidade: string;
  profissionalId: string;
  /** Formato do input de data: aaaa-mm-dd. */
  data: string;
  /** Formato do input de hora: hh:mm. */
  horario: string;
  prioridade: string;
}

export interface NovaConsulta {
  paciente: DadosPaciente;
  consulta: DadosConsulta;
}
