import { describe, expect, it, vi } from 'vitest';

import { AutenticacaoGuard } from './autenticacao.guard.js';

function criarContexto(request: object) {
  const handler = () => undefined;
  class Controlador {}
  const context = {
    switchToHttp: () => ({ getRequest: () => request }),
    getHandler: () => handler,
    getClass: () => Controlador,
  };

  return context as never;
}

function criarGuard(guardsProprios?: unknown[]) {
  const reflector = {
    getAllAndOverride: vi.fn().mockReturnValue(guardsProprios),
  };
  const funcionarioGuard = { canActivate: vi.fn().mockResolvedValue(true) };
  const guard = new AutenticacaoGuard(
    reflector as never,
    funcionarioGuard as never,
  );

  return { guard, reflector, funcionarioGuard };
}

describe('AutenticacaoGuard (global)', () => {
  it.each([
    ['GET', '/'],
    ['POST', '/auth/login'],
    ['POST', '/paciente/login'],
  ])(
    'deixa passar a rota pública %s %s sem pedir token',
    async (method, path) => {
      const { guard, funcionarioGuard } = criarGuard();

      const resultado = await guard.canActivate(
        criarContexto({ method, path }),
      );

      expect(resultado).toBe(true);
      expect(funcionarioGuard.canActivate).not.toHaveBeenCalled();
    },
  );

  it('ignora a barra final e a query string na rota pública', async () => {
    const { guard, funcionarioGuard } = criarGuard();

    const resultado = await guard.canActivate(
      criarContexto({ method: 'POST', url: '/auth/login/?x=1' }),
    );

    expect(resultado).toBe(true);
    expect(funcionarioGuard.canActivate).not.toHaveBeenCalled();
  });

  it('a rota pública vale só para o método liberado', async () => {
    const { guard, funcionarioGuard } = criarGuard();

    await guard.canActivate(
      criarContexto({ method: 'GET', path: '/auth/login' }),
    );

    expect(funcionarioGuard.canActivate).toHaveBeenCalledTimes(1);
  });

  it('deixa passar a rota que declara o próprio guard', async () => {
    const { guard, funcionarioGuard } = criarGuard([class GuardProprio {}]);

    const resultado = await guard.canActivate(
      criarContexto({ method: 'GET', path: '/paciente/fila' }),
    );

    expect(resultado).toBe(true);
    expect(funcionarioGuard.canActivate).not.toHaveBeenCalled();
  });

  it('exige o token do funcionário nas demais rotas', async () => {
    const { guard, funcionarioGuard } = criarGuard();

    const resultado = await guard.canActivate(
      criarContexto({ method: 'GET', path: '/pacientes' }),
    );

    expect(funcionarioGuard.canActivate).toHaveBeenCalledTimes(1);
    expect(resultado).toBe(true);
  });

  it('propaga a recusa do guard do funcionário', async () => {
    const { guard, funcionarioGuard } = criarGuard();
    funcionarioGuard.canActivate.mockRejectedValue(
      new Error('Token não informado'),
    );

    await expect(
      guard.canActivate(criarContexto({ method: 'GET', path: '/fila' })),
    ).rejects.toThrow('Token não informado');
  });
});
