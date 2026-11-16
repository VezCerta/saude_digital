import { describe, expect, it, vi } from 'vitest';

import { FilaService } from './fila.service.js';
import { StatusAtendimento } from '../entities/atendimento.entity.js';

function criarServico() {
  const atendimentoRepository = { find: vi.fn() };
  const service = new FilaService(
    atendimentoRepository as never,
    {} as never,
    {} as never,
  );

  return { service, atendimentoRepository };
}

const pessoa = (id: number, nome: string) => ({
  id,
  senha: `L00${id}`,
  status: StatusAtendimento.AGUARDANDO,
  paciente: { nome },
  profissional: { nome: 'Dra. Luiza Freitas' },
});

describe('Regra da fila (ordem de chegada por profissional)', () => {
  it('consulta o banco ordenando pela hora de chegada, do mais antigo ao mais novo', async () => {
    const { service, atendimentoRepository } = criarServico();
    atendimentoRepository.find.mockResolvedValue([]);

    await service.listarFila(2);

    const consulta = atendimentoRepository.find.mock.calls[0][0];
    expect(consulta.order).toEqual({ dataHoraChegada: 'ASC' });
  });

  it('só entram na fila os atendimentos ativos', async () => {
    const { service, atendimentoRepository } = criarServico();
    atendimentoRepository.find.mockResolvedValue([]);

    await service.listarFila();

    const { where } = atendimentoRepository.find.mock.calls[0][0];
    expect(where.status.value).toEqual([
      StatusAtendimento.AGUARDANDO,
      StatusAtendimento.EM_TRIAGEM,
      StatusAtendimento.EM_ATENDIMENTO,
    ]);
    expect(where.status.value).not.toContain(StatusAtendimento.CANCELADO);
    expect(where.status.value).not.toContain(StatusAtendimento.FINALIZADO);
  });

  it('a posição segue a ordem recebida, começando em 1', async () => {
    const { service, atendimentoRepository } = criarServico();
    atendimentoRepository.find.mockResolvedValue([
      pessoa(1, 'Sabrina Oliveira'),
      pessoa(2, 'Antônio Carlos'),
      pessoa(3, 'Ricardo Felipe'),
    ]);

    const fila = await service.listarFila(2);

    expect(fila.map((item) => [item.posicao, item.paciente.nome])).toEqual([
      [1, 'Sabrina Oliveira'],
      [2, 'Antônio Carlos'],
      [3, 'Ricardo Felipe'],
    ]);
  });

  it('quando o primeiro sai, todos sobem uma posição', async () => {
    const { service, atendimentoRepository } = criarServico();
    atendimentoRepository.find
      .mockResolvedValueOnce([
        pessoa(1, 'Sabrina Oliveira'),
        pessoa(2, 'Antônio Carlos'),
        pessoa(3, 'Ricardo Felipe'),
      ])
      .mockResolvedValueOnce([
        pessoa(2, 'Antônio Carlos'),
        pessoa(3, 'Ricardo Felipe'),
      ]);

    const antes = await service.listarFila(2);
    const depois = await service.listarFila(2);

    expect(
      antes.find((i) => i.paciente.nome === 'Antônio Carlos')?.posicao,
    ).toBe(2);
    expect(
      depois.find((i) => i.paciente.nome === 'Antônio Carlos')?.posicao,
    ).toBe(1);
    expect(
      depois.find((i) => i.paciente.nome === 'Ricardo Felipe')?.posicao,
    ).toBe(2);
  });

  it('cada profissional tem a própria fila, com posições que recomeçam em 1', async () => {
    const { service, atendimentoRepository } = criarServico();
    atendimentoRepository.find.mockResolvedValue([
      pessoa(7, 'Ana Souza Matias'),
    ]);

    const fila = await service.listarFila(1);

    const { where } = atendimentoRepository.find.mock.calls[0][0];
    expect(where.profissional).toEqual({ id: 1 });
    expect(fila[0].posicao).toBe(1);
  });
});
