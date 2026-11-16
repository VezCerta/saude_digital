import { compare } from 'bcryptjs';
import { describe, expect, it, vi } from 'vitest';

import { PacientesService } from './pacientes.service.js';

function criarServico() {
  const pacienteRepository = {
    create: vi.fn((dados: unknown) => dados),
    save: vi.fn(async (dados: object) => ({ ...dados })),
    find: vi.fn().mockResolvedValue([]),
  };
  const service = new PacientesService(pacienteRepository as never);

  return { service, pacienteRepository };
}

describe('PacientesService', () => {
  it('cadastra normalizando os dados e guardando só o hash da senha', async () => {
    const { service, pacienteRepository } = criarServico();

    const resultado = await service.criar({
      nome: '  João da Silva ',
      identificador: ' 111.456.789-22 ',
      email: ' JOAO.SILVA@EMAIL.COM ',
      telefone: '   ',
      dataNascimento: '1985-05-15',
      endereco: ' Rua José de Alencar, 245 ',
      senha: '15051985',
    });

    const gravado = pacienteRepository.create.mock.calls[0][0] as {
      senhaHash: string;
    };
    expect(gravado).toMatchObject({
      nome: 'João da Silva',
      identificador: '111.456.789-22',
      email: 'joao.silva@email.com',
      telefone: null,
      dataNascimento: '1985-05-15',
      endereco: 'Rua José de Alencar, 245',
    });
    expect(gravado.senhaHash).not.toBe('15051985');
    expect(await compare('15051985', gravado.senhaHash)).toBe(true);
    expect(resultado.senhaHash).toBeNull();
  });

  it('cadastra sem senha: o paciente ainda não tem acesso ao app', async () => {
    const { service, pacienteRepository } = criarServico();

    await service.criar({ nome: 'Ana', identificador: '987.654.321-11' });

    expect(pacienteRepository.create.mock.calls[0][0]).toMatchObject({
      senhaHash: null,
      email: null,
      dataNascimento: null,
      endereco: null,
    });
  });

  it('recusa senha com menos de 6 caracteres e não grava', async () => {
    const { service, pacienteRepository } = criarServico();

    await expect(
      service.criar({ nome: 'Ana', identificador: '1', senha: '123' }),
    ).rejects.toThrow('pelo menos 6 caracteres');
    expect(pacienteRepository.save).not.toHaveBeenCalled();
  });

  it('lista todos em ordem alfabética quando não há busca', async () => {
    const { service, pacienteRepository } = criarServico();

    await service.listar();

    expect(pacienteRepository.find).toHaveBeenCalledWith({
      order: { nome: 'ASC' },
    });
  });

  it('trata busca só com espaços como sem busca', async () => {
    const { service, pacienteRepository } = criarServico();

    await service.listar('   ');

    expect(pacienteRepository.find).toHaveBeenCalledWith({
      order: { nome: 'ASC' },
    });
  });

  it('busca por nome ou CPF com o mesmo termo', async () => {
    const { service, pacienteRepository } = criarServico();

    await service.listar(' maria ');

    const { where, order } = pacienteRepository.find.mock.calls[0][0];
    expect(where).toHaveLength(2);
    expect(where[0].nome.value).toBe('%maria%');
    expect(where[1].identificador.value).toBe('%maria%');
    expect(order).toEqual({ nome: 'ASC' });
  });
});
