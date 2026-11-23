import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import type { Route } from "./+types/fila";
import { MainLayout } from "@/layouts/MainLayout";
import { Button } from "@/components/ui/Button";
import { ModalConfirmacao } from "@/components/ui/ModalConfirmacao";
import { AvisoSucesso } from "@/components/ui/AvisoSucesso";
import { AbasProfissionais } from "@/components/fila/AbasProfissionais";
import { TabelaFila } from "@/components/fila/TabelaFila";
import { formatDate } from "@/utils";
import {
  SOLICITACOES_PENDENTES_MOCK,
  filtrarFilas,
  numerarPosicoes,
  obterFilasMock,
} from "@/services/fila";
import type {
  FilaProfissional,
  PacienteNaFila,
  Profissional,
} from "@/types/fila";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Saúde Digital - Fila" },
    {
      name: "description",
      content: "Acompanhe as filas de atendimento da UBS",
    },
  ];
}

interface AlvoRemocao {
  profissional: Profissional;
  paciente: PacienteNaFila;
}

export default function Fila() {
  const navigate = useNavigate();

  const [filas, setFilas] = useState<FilaProfissional[]>(obterFilasMock);
  const [busca, setBusca] = useState("");
  const [profissionalAtivoId, setProfissionalAtivoId] = useState(
    () => filas[0]?.profissional.id ?? "",
  );
  const [alvoRemocao, setAlvoRemocao] = useState<AlvoRemocao | null>(null);
  const [mensagemAviso, setMensagemAviso] = useState<string | null>(null);

  // A data é calculada só no navegador: com SSR, servidor e cliente podem
  // estar em fusos diferentes e divergir na hidratação perto da meia-noite.
  const [hoje, setHoje] = useState("");
  useEffect(() => {
    setHoje(formatDate(new Date()));
  }, []);

  useEffect(() => {
    if (!mensagemAviso) return;
    const timer = window.setTimeout(() => setMensagemAviso(null), 3000);
    return () => window.clearTimeout(timer);
  }, [mensagemAviso]);

  const visiveis = useMemo(() => filtrarFilas(filas, busca), [filas, busca]);
  const profissionaisVisiveis = useMemo(
    () => visiveis.map((fila) => fila.profissional),
    [visiveis],
  );

  // Se a aba selecionada some por causa da busca, mostra a primeira visível.
  const ativa =
    visiveis.find((fila) => fila.profissional.id === profissionalAtivoId) ??
    visiveis[0];

  function atualizarFilaAtiva(
    transformar: (fila: FilaProfissional) => FilaProfissional,
  ) {
    if (!ativa) return;
    setFilas((atual) =>
      atual.map((fila) =>
        fila.profissional.id === ativa.profissional.id
          ? transformar(fila)
          : fila,
      ),
    );
  }

  function alternarPausaFila() {
    if (!ativa) return;
    const novoEstado = !ativa.pausada;
    atualizarFilaAtiva((fila) => ({
      ...fila,
      pausada: novoEstado,
    }));
    setMensagemAviso(
      novoEstado ? "Fila pausada temporariamente." : "Fila retomada.",
    );
  }

  function chamarPaciente(pacienteAlvo: PacienteNaFila) {
    if (!ativa || ativa.pausada) return;
    atualizarFilaAtiva((fila) => ({
      ...fila,
      emChamada: {
        paciente: pacienteAlvo,
        horarioChamada: "00:01",
        consultorio: fila.profissional.consultorio ?? "Consultório 1",
      },
      pacientes: numerarPosicoes(
        fila.pacientes.filter((item) => item.id !== pacienteAlvo.id),
      ),
    }));
    setMensagemAviso(`Chamando ${pacienteAlvo.nome}.`);
  }

  function chamarProximo() {
    if (!ativa || ativa.pausada || ativa.pacientes.length === 0) return;
    chamarPaciente(ativa.pacientes[0]);
  }

  function iniciarAtendimento() {
    if (!ativa?.emChamada) return;
    const nome = ativa.emChamada.paciente.nome;
    atualizarFilaAtiva((fila) =>
      fila.emChamada
        ? {
            ...fila,
            emChamada: {
              ...fila.emChamada,
              emAtendimento: true,
            },
          }
        : fila,
    );
    setMensagemAviso(`Atendimento de ${nome} iniciado.`);
  }

  function finalizarAtendimento() {
    if (!ativa?.emChamada) return;
    const nome = ativa.emChamada.paciente.nome;
    atualizarFilaAtiva((fila) => ({
      ...fila,
      emChamada: null,
    }));
    setMensagemAviso(`Atendimento de ${nome} finalizado.`);
  }

  function chamarNovamente() {
    if (!ativa?.emChamada) return;
    const nome = ativa.emChamada.paciente.nome;
    atualizarFilaAtiva((fila) =>
      fila.emChamada
        ? {
            ...fila,
            emChamada: {
              ...fila.emChamada,
              horarioChamada: "00:00",
            },
          }
        : fila,
    );
    setMensagemAviso(`Chamando novamente ${nome} no painel.`);
  }

  function registrarAusencia() {
    if (!ativa?.emChamada) return;
    const nome = ativa.emChamada.paciente.nome;
    atualizarFilaAtiva((fila) => ({
      ...fila,
      emChamada: null,
    }));
    setMensagemAviso(`Ausência de ${nome} registrada.`);
  }

  function subirPosicao(paciente: PacienteNaFila) {
    if (!ativa) return;
    atualizarFilaAtiva((fila) => {
      const idx = fila.pacientes.findIndex((item) => item.id === paciente.id);
      if (idx <= 0) return fila;
      const copia = [...fila.pacientes];
      const [removido] = copia.splice(idx, 1);
      copia.splice(idx - 1, 0, removido);
      return {
        ...fila,
        pacientes: numerarPosicoes(copia),
      };
    });
  }

  function confirmarRemocao() {
    if (!alvoRemocao) return;
    const { profissional, paciente } = alvoRemocao;

    setFilas((atual) =>
      atual.map((fila) =>
        fila.profissional.id === profissional.id
          ? {
              ...fila,
              pacientes: numerarPosicoes(
                fila.pacientes.filter((item) => item.id !== paciente.id),
              ),
            }
          : fila,
      ),
    );
    setAlvoRemocao(null);
    setMensagemAviso(`${paciente.nome} removido da fila.`);
  }

  return (
    <MainLayout>
      <div className="flex flex-col gap-5">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Bom dia!
            </h1>
            <p className="mt-1 text-base text-gray-600 dark:text-gray-300">
              Acompanhe as filas de atendimento da UBS para hoje.
            </p>
          </div>
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {hoje}
          </span>
        </header>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="relative w-full max-w-md">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-500 dark:text-gray-400"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              type="text"
              value={busca}
              onChange={(evento) => setBusca(evento.target.value)}
              placeholder="Buscar fila por médico ou paciente"
              aria-label="Buscar fila por médico ou paciente"
              className="w-full rounded-full bg-[#ebedf3] py-2 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#005b96] dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-400"
            />
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => navigate("/consulta/nova")}
            >
              + Nova consulta
            </Button>

            <div className="relative">
              <Button
                variant="brand"
                onClick={() => navigate("/saidas")}
                aria-label={
                  SOLICITACOES_PENDENTES_MOCK > 0
                    ? `Solicitações de saída, ${SOLICITACOES_PENDENTES_MOCK} pendentes`
                    : "Solicitações de saída"
                }
              >
                Solicitações de saída
              </Button>
              {SOLICITACOES_PENDENTES_MOCK > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-red-600 px-1.5 text-xs font-bold text-white"
                >
                  {SOLICITACOES_PENDENTES_MOCK}
                </span>
              )}
            </div>
          </div>
        </div>

        {ativa ? (
          <>
            {/* 1. Abas dos profissionais */}
            <section className="rounded-2xl border border-[#c0c6d0] bg-white shadow-2xs dark:border-blue-600 dark:bg-gray-900">
              <AbasProfissionais
                profissionais={profissionaisVisiveis}
                ativoId={ativa.profissional.id}
                onSelecionar={setProfissionalAtivoId}
              />
            </section>

            {/* 2. Painel de controle e paciente em chamada */}
            <section className="flex flex-col gap-4 rounded-2xl border border-[#c0c6d0] bg-white p-5 shadow-2xs dark:border-blue-600 dark:bg-gray-900">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-gray-900 dark:text-white">
                      Fila de {ativa.profissional.nome}
                    </h2>
                    {ativa.pausada && (
                      <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                        Pausada
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    {ativa.pacientes.length} aguardando ·{" "}
                    {ativa.emChamada ? "1 em chamada" : "0 em chamada"}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={alternarPausaFila}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#005b96] bg-white px-4 py-2 text-xs font-semibold text-[#005b96] transition-colors hover:bg-[#eaf3fb] dark:border-blue-400 dark:bg-gray-900 dark:text-blue-400 dark:hover:bg-gray-800"
                  >
                    {ativa.pausada ? (
                      <>
                        <svg
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden="true"
                          className="size-3.5"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                        Retomar fila
                      </>
                    ) : (
                      <>
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          aria-hidden="true"
                          className="size-3.5"
                        >
                          <line x1="9" x2="9" y1="5" y2="19" />
                          <line x1="15" x2="15" y1="5" y2="19" />
                        </svg>
                        Pausar fila
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={chamarProximo}
                    disabled={ativa.pausada || ativa.pacientes.length === 0}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#005b96] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#00487a] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      className="size-4"
                    >
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                    </svg>
                    Chamar próximo
                  </button>
                </div>
              </div>

              {ativa.emChamada ? (
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#b8d8f3] bg-[#eaf3fb] p-4 dark:border-blue-800 dark:bg-blue-950/40">
                  <div>
                    <span
                      className={
                        ativa.emChamada.emAtendimento
                          ? "block text-[11px] font-bold uppercase tracking-wider text-[#1e6027] dark:text-emerald-400"
                          : "block text-[11px] font-bold uppercase tracking-wider text-[#005b96] dark:text-blue-400"
                      }
                    >
                      {ativa.emChamada.emAtendimento
                        ? "Em atendimento"
                        : "Chamando agora"}
                    </span>
                    <h3 className="mt-0.5 text-lg font-bold text-gray-900 dark:text-white">
                      {ativa.emChamada.paciente.nome}
                    </h3>
                    <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-300">
                      Chamada há {ativa.emChamada.horarioChamada} ·{" "}
                      {ativa.emChamada.consultorio}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {ativa.emChamada.emAtendimento ? (
                      <>
                        <button
                          type="button"
                          onClick={finalizarAtendimento}
                          className="cursor-pointer rounded-lg bg-[#1e6027] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#16491d]"
                        >
                          Finalizar atendimento
                        </button>

                        <button
                          type="button"
                          onClick={chamarNovamente}
                          className="cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                        >
                          Chamar novamente
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={iniciarAtendimento}
                          className="cursor-pointer rounded-lg bg-[#005b96] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#00487a]"
                        >
                          Iniciar atendimento
                        </button>

                        <button
                          type="button"
                          onClick={chamarNovamente}
                          className="cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                        >
                          Chamar novamente
                        </button>

                        <button
                          type="button"
                          onClick={registrarAusencia}
                          className="cursor-pointer rounded-lg border border-red-400 bg-white px-4 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 dark:border-red-800 dark:bg-gray-900 dark:text-red-400 dark:hover:bg-red-950/40"
                        >
                          Registrar ausência
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50/70 px-4 py-5 text-center text-xs text-gray-500 dark:border-gray-700 dark:bg-gray-800/40 dark:text-gray-400">
                  Nenhum paciente em chamada no momento. Use{" "}
                  <strong className="text-gray-700 dark:text-gray-200">
                    Chamar próximo
                  </strong>{" "}
                  ou selecione um paciente na lista abaixo.
                </div>
              )}
            </section>

            {/* 3. Tabela de pacientes aguardando */}
            <section className="overflow-hidden rounded-2xl border border-[#c0c6d0] bg-white shadow-2xs dark:border-blue-600 dark:bg-gray-900">
              <TabelaFila
                pacientes={ativa.pacientes}
                filaPausada={ativa.pausada}
                onChamar={chamarPaciente}
                onSubirPosicao={subirPosicao}
                onRemover={(paciente) =>
                  setAlvoRemocao({ profissional: ativa.profissional, paciente })
                }
              />
            </section>
          </>
        ) : (
          <section className="rounded-2xl border border-[#c0c6d0] bg-white px-6 py-12 text-center text-gray-600 dark:border-blue-600 dark:bg-gray-900 dark:text-gray-400">
            {busca.trim()
              ? "Nenhum resultado para a busca."
              : "Nenhuma fila disponível."}
          </section>
        )}
      </div>

      <ModalConfirmacao
        aberto={alvoRemocao !== null}
        titulo={
          alvoRemocao ? `Remover ${alvoRemocao.paciente.nome} da fila?` : ""
        }
        descricao={
          alvoRemocao
            ? `O paciente sai da fila de ${alvoRemocao.profissional.nome} e as posições são atualizadas.`
            : ""
        }
        textoConfirmar="Remover paciente"
        onConfirmar={confirmarRemocao}
        onCancelar={() => setAlvoRemocao(null)}
      />

      <AvisoSucesso
        visivel={mensagemAviso !== null}
        mensagem={mensagemAviso ?? ""}
      />
    </MainLayout>
  );
}
