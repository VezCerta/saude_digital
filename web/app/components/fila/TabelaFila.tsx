import type { PacienteNaFila } from "~/types/fila";

interface TabelaFilaProps {
  pacientes: PacienteNaFila[];
  /** Mensagem exibida quando não há pacientes para mostrar. */
  mensagemVazia?: string;
  filaPausada?: boolean;
  onChamar?: (paciente: PacienteNaFila) => void;
  onSubirPosicao?: (paciente: PacienteNaFila) => void;
  onRemover: (paciente: PacienteNaFila) => void;
}

export function TabelaFila({
  pacientes,
  mensagemVazia = "Nenhum paciente aguardando na fila.",
  filaPausada = false,
  onChamar,
  onSubirPosicao,
  onRemover,
}: TabelaFilaProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead className="bg-[#f4f7fb] border-b border-gray-200 dark:border-gray-800 dark:bg-gray-800/80">
          <tr className="text-xs font-bold text-[#005b96] dark:text-blue-400">
            <th scope="col" className="w-24 px-6 py-3.5 text-left">
              Posição
            </th>
            <th scope="col" className="px-6 py-3.5 text-left">
              Paciente
            </th>
            <th scope="col" className="w-48 px-6 py-3.5 text-center">
              Prioridade
            </th>
            <th scope="col" className="w-64 px-6 py-3.5 text-right">
              Ações
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
          {pacientes.length === 0 ? (
            <tr>
              <td
                colSpan={4}
                className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400"
              >
                {mensagemVazia}
              </td>
            </tr>
          ) : (
            pacientes.map((paciente, indice) => {
              const ehPrioritario =
                paciente.prioridade.toLowerCase() !== "normal";

              return (
                <tr
                  key={paciente.id}
                  className="transition-colors hover:bg-gray-50/70 dark:hover:bg-gray-800/40"
                >
                  <td className="px-6 py-4 text-left text-base font-bold text-[#005b96] dark:text-blue-400">
                    {paciente.posicao}º
                  </td>

                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {paciente.nome}
                    </div>
                    <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                      Chegada {paciente.chegada}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <span
                      className={
                        ehPrioritario
                          ? "inline-flex items-center rounded-full bg-[#dceefb] px-3 py-1 text-xs font-semibold text-[#005b96] dark:bg-blue-950/70 dark:text-blue-300"
                          : "inline-flex items-center rounded-full bg-[#ebedf3] px-3 py-1 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      }
                    >
                      {paciente.prioridade}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        disabled={filaPausada}
                        onClick={() => onChamar?.(paciente)}
                        aria-label={`Chamar ${paciente.nome}`}
                        className="cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                      >
                        Chamar
                      </button>

                      <button
                        type="button"
                        onClick={() => onSubirPosicao?.(paciente)}
                        aria-label={`Subir posição de ${paciente.nome}`}
                        title={
                          indice === 0
                            ? "Já está na 1ª posição"
                            : "Mover para cima na fila"
                        }
                        className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg border border-[#b8d8f3] bg-[#eaf3fb] text-[#005b96] transition-colors hover:bg-[#d6e9f8] dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
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
                          <path d="M12 19V5" />
                          <path d="m5 12 7-7 7 7" />
                        </svg>
                      </button>

                      <button
                        type="button"
                        onClick={() => onRemover(paciente)}
                        aria-label={`Remover ${paciente.nome} da fila`}
                        title="Remover paciente da fila"
                        className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg border border-red-300 bg-red-50 text-red-600 transition-colors hover:bg-red-100 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400"
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
                          <path d="M3 6h18" />
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          <line x1="10" x2="10" y1="11" y2="17" />
                          <line x1="14" x2="14" y1="11" y2="17" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
