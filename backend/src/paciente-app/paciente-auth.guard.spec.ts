import { describe, expect, it, vi } from 'vitest';

import { PacienteAuthGuard } from './paciente-auth.guard.js';

function criarContexto(authorization?: string) {
  const request: {
    headers: Record<string, string | undefined>;
    pacienteId?: number;
  } = { headers: { authorization } };
  const context = {
    switchToHttp: () => ({ getRequest: () => request }),
  };

  return { request, context: context as never };
}

describe('PacienteAuthGuard', () => {
  it('recusa requisição sem token', async () => {
    const guard = new PacienteAuthGuard({ verifyAsync: vi.fn() } as never);

    await expect(guard.canActivate(criarContexto().context)).rejects.toThrow(
      'Token não informado',
    );
  });

  it('recusa cabeçalho que não é Bearer', async () => {
    const guard = new PacienteAuthGuard({ verifyAsync: vi.fn() } as never);

    await expect(
      guard.canActivate(criarContexto('Basic abc').context),
    ).rejects.toThrow('Token não informado');
  });

  it('aceita token de paciente e guarda o id na requisição', async () => {
    const jwtService = {
      verifyAsync: vi.fn().mockResolvedValue({ sub: 10, tipo: 'paciente' }),
    };
    const guard = new PacienteAuthGuard(jwtService as never);
    const { request, context } = criarContexto('Bearer abc');

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.pacienteId).toBe(10);
  });

  it('recusa token de funcionário com a mensagem "Token inválido"', async () => {
    const jwtService = {
      verifyAsync: vi.fn().mockResolvedValue({ sub: 1, tipo: 'funcionario' }),
    };
    const guard = new PacienteAuthGuard(jwtService as never);

    await expect(
      guard.canActivate(criarContexto('Bearer abc').context),
    ).rejects.toMatchObject({ message: 'Token inválido' });
  });

  it('recusa token expirado ou adulterado', async () => {
    const jwtService = {
      verifyAsync: vi.fn().mockRejectedValue(new Error('jwt expired')),
    };
    const guard = new PacienteAuthGuard(jwtService as never);

    await expect(
      guard.canActivate(criarContexto('Bearer abc').context),
    ).rejects.toMatchObject({ message: 'Token inválido ou expirado' });
  });
});
