import { afterEach, describe, expect, it, vi } from 'vitest';

import { ConsultasService } from './consultas.service.js';
import { StatusAtendimento } from '../entities/atendimento.entity.js';

function criarServico() {
  const atendimentoRepository = {
    find: vi.fn().mockResolvedValue([]),
    create: vi.fn((dados: unknown) => dados),
    save: vi.fn(async (dados: unknown) => dados),
  };
  const pacienteRepository = { findOne: vi.fn() };
  const profissionalRepository = { findOne: vi.fn() };

  const service = new ConsultasService(
    atendimentoRepository as never,
    pacienteRepository as never,
    profissionalRepository as never,
  );

  return {
    service,
    atendimentoRepository,
    pacienteRepository,
    profissionalRepository,
  };
}

const atendimento = {
  id: 6,
  status: StatusAtendimento.AGUARDANDO,
  dataHoraChegada: new Date('2026-11-03T15:00:00Z'),
  paciente: { nome: 'Maria do Socorro', identificador: '123.456.789-00' },
  profissional: { id: 1, nome: 'Dr. Ricardo Mendes' },
};

describe('ConsultasService', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('lista as consultas com nome e CPF do paciente', async () => {
    const { service, atendimentoRepository } = criarServico();
    atendimentoRepository.find.mockResolvedValue([atendimento]);

    const resultado = await service.listar(1, '2026-11-03');

    expect(resultado[0]).toMatchObject({
      id: 6,
      status: StatusAtendimento.AGUARDANDO,
      horario: atendimento.dataHoraChegada,
      paciente: { nome: 'Maria do Socorro', cpf: '123.456.789-00' },
      profissional: { id: 1, nome: 'Dr. Ricardo Mendes' },
    });
  });

  it('devolve profissional nulo quando o atendimento não tem profissional', async () => {
    const { service, atendimentoRepository } = criarServico();
    atendimentoRepository.find.mockResolvedValue([
      { ...atendimento, profissional: null },
    ]);

    const resultado = await service.listar(undefined, '2026-11-03');

    expect(resultado[0].profissional).toBeNull();
  });

  it('filtra pelo profissional e pelo dia, no fuso -03:00', async () => {
    const { service, atendimentoRepository } = criarServico();

    await service.listar(2, '2026-11-03');

    const { where } = atendimentoRepository.find.mock.calls[0][0];
    const [inicio, fim] = where.dataHoraChegada.value;
    expect(where.profissional).toEqual({ id: 2 });
    expect(inicio.toISOString()).toBe('2026-11-03T03:00:00.000Z');
    expect(fim.toISOString()).toBe('2026-11-04T02:59:59.999Z');
  });

  it('não filtra por profissional quando nenhum é informado', async () => {
    const { service, atendimentoRepository } = criarServico();

    await service.listar(undefined, '2026-11-03');

    const { where } = atendimentoRepository.find.mock.calls[0][0];
    expect(where).not.toHaveProperty('profissional');
  });

  it('não lista consultas canceladas', async () => {
    const { service, atendimentoRepository } = criarServico();

    await service.listar(1, '2026-11-03');

    const { where } = atendimentoRepository.find.mock.calls[0][0];
    expect(where.status.value).toBe(StatusAtendimento.CANCELADO);
  });

  it('sem data informada usa o dia de hoje', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-10T15:00:00Z'));
    const { service, atendimentoRepository } = criarServico();

    await service.listar(1);

    const { where } = atendimentoRepository.find.mock.calls[0][0];
    expect(where.dataHoraChegada.value[0].toISOString()).toBe(
      '2026-11-10T03:00:00.000Z',
    );
  });

  it('não cadastra consulta para paciente inexistente', async () => {
    const { service, pacienteRepository } = criarServico();
    pacienteRepository.findOne.mockResolvedValue(null);

    await expect(
      service.criar({ pacienteId: 99, profissionalId: 1 }),
    ).rejects.toThrow('Paciente não encontrado');
  });

  it('não cadastra consulta para profissional inexistente', async () => {
    const { service, pacienteRepository, profissionalRepository } =
      criarServico();
    pacienteRepository.findOne.mockResolvedValue({ id: 1 });
    profissionalRepository.findOne.mockResolvedValue(null);

    await expect(
      service.criar({ pacienteId: 1, profissionalId: 99 }),
    ).rejects.toThrow('Profissional não encontrado');
  });

  it('cadastra a consulta como AGUARDANDO com senha gerada', async () => {
    const { service, pacienteRepository, profissionalRepository } =
      criarServico();
    pacienteRepository.findOne.mockResolvedValue({ id: 1 });
    profissionalRepository.findOne.mockResolvedValue({ id: 2 });

    const resultado = await service.criar({ pacienteId: 1, profissionalId: 2 });

    expect(resultado.status).toBe(StatusAtendimento.AGUARDANDO);
    expect(resultado.senha).toMatch(/^C\d{9}$/);
  });
});
