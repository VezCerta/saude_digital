import { describe, expect, it, vi } from 'vitest';

import { PacienteFilaService } from './paciente-fila.service.js';

describe('PacienteFilaService.profissionais', () => {
  it('lista as abas na ordem do cadastro, só com id, nome e cargo', async () => {
    const profissionalRepository = {
      find: vi.fn().mockResolvedValue([
        {
          id: 1,
          nome: 'Dr. Ricardo Mendes',
          cargo: 'Clínico Geral',
          registroProfissional: 'CRM-123',
        },
        {
          id: 2,
          nome: 'Dra. Luiza Freitas',
          cargo: 'Dentista',
          registroProfissional: null,
        },
      ]),
    };
    const service = new PacienteFilaService(
      {} as never,
      profissionalRepository as never,
      {} as never,
    );

    const resultado = await service.profissionais();

    expect(profissionalRepository.find).toHaveBeenCalledWith({
      order: { id: 'ASC' },
    });
    expect(resultado).toEqual([
      { id: 1, nome: 'Dr. Ricardo Mendes', cargo: 'Clínico Geral' },
      { id: 2, nome: 'Dra. Luiza Freitas', cargo: 'Dentista' },
    ]);
  });
});
