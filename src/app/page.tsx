"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { UserButton, useAuth } from "@clerk/nextjs";

interface Embalagem {
  id: number;
  quantidadeBags: number;
  status: string;
  prazoLimite: string;
  dataRecebimento: string | null;
  notaFiscal: {
    numeroDaNota: string;
    cliente: { nome: string; };
  };
  funcionarioRecebedor: { nome: string; } | null;
}

interface Funcionario {
  id: number;
  nome: string;
}

export default function Dashboard() {
  const { getToken } = useAuth();

  const [embalagens, setEmbalagens] = useState<Embalagem[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalAberta, setModalAberta] = useState(false);
  const [embalagemSelecionada, setEmbalagemSelecionada] = useState<number | null>(null);
  const [formBaixa, setFormBaixa] = useState({ quantidade: "", funcionarioId: "" });
  const [loadingBaixa, setLoadingBaixa] = useState(false);

  useEffect(() => {
    const buscarDados = async () => {
      try {
        const token = await getToken();
        const headers = { "Authorization": `Bearer ${token}` };

        const resEmb = await fetch("http://localhost:8080/api/embalagens-retorno", { headers });
        if (resEmb.ok) {
          const dataEmb = await resEmb.json();
          setEmbalagens(dataEmb);
        }

        const resFunc = await fetch("http://localhost:8080/api/funcionarios", { headers });
        if (resFunc.ok) {
          const dataFunc = await resFunc.json();
          setFuncionarios(dataFunc);
        }
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
      } finally {
        setLoading(false);
      }
    };

    buscarDados();
  }, [getToken]);

  const fecharModal = () => {
    setModalAberta(false);
    setEmbalagemSelecionada(null);
    setFormBaixa({ quantidade: "", funcionarioId: "" });
  };

  const registrarBaixa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!embalagemSelecionada) return;

    setLoadingBaixa(true);
    try {
      const token = await getToken();
      const url = `http://localhost:8080/api/embalagens-retorno/${embalagemSelecionada}/registrar-retorno?quantidade=${formBaixa.quantidade}&funcionarioId=${formBaixa.funcionarioId}`;

      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (res.ok) {
        const embalagemAtualizada = await res.json();
        setEmbalagens((prev) =>
          prev.map((emb) => (emb.id === embalagemSelecionada ? embalagemAtualizada : emb))
        );
        fecharModal();
      } else {
        alert("Erro ao registrar a baixa.");
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro de conexão com o servidor.");
    } finally {
      setLoadingBaixa(false);
    }
  };

  // ==========================================
  // FUNÇÃO INTELIGENTE DE STATUS
  // ==========================================
  const getStatusReal = (embalagem: Embalagem) => {
    // Se o motorista já recolheu, o caso está encerrado independentemente da data
    if (embalagem.status === "RECEBIDO_NUTRIGUACU") return "RECEBIDO_NUTRIGUACU";

    if (!embalagem.prazoLimite) return embalagem.status;

    // Pega a data atual
    const hoje = new Date();

    // Extrai o ano, mês e dia da string que vem do banco de dados (seguro contra fusos horários)
    const dataLimiteStr = embalagem.prazoLimite.split('T')[0];
    const [ano, mes, dia] = dataLimiteStr.split('-');

    // Cria a data limite garantindo que o cliente tem até o último minuto do dia
    const dataLimite = new Date(Number(ano), Number(mes) - 1, Number(dia));
    dataLimite.setHours(23, 59, 59, 999);

    // O pulo do gato: o banco pode dizer PENDENTE, mas se a data já passou, o sistema acusa o ATRASO
    if (embalagem.status === "PENDENTE" && hoje > dataLimite) {
      return "ATRASADO";
    }

    return embalagem.status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "RECEBIDO_NUTRIGUACU": return "bg-green-100 text-green-800";
      case "PENDENTE": return "bg-yellow-100 text-yellow-800";
      case "ATRASADO": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // ==========================================
  // CÁLCULO DAS MÉTRICAS COM O STATUS REAL
  // ==========================================
  let totalPendentes = 0;
  let totalAtrasadas = 0;
  let totalRecebidas = 0;

  embalagens.forEach((e) => {
    const statusReal = getStatusReal(e);
    if (statusReal === "PENDENTE") totalPendentes += e.quantidadeBags;
    else if (statusReal === "ATRASADO") totalAtrasadas += e.quantidadeBags;
    else if (statusReal === "RECEBIDO_NUTRIGUACU") totalRecebidas += e.quantidadeBags;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans text-gray-900">
      <header className="mb-8 border-b pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Operações Logísticas</h1>
          <p className="text-gray-600 mt-2 text-sm">
            Painel de controle focado em suporte técnico e acompanhamento do pós-venda.
          </p>
        </div>
        <div className="flex gap-4 items-center">
          <Link href="/relatorios" className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm font-semibold transition-colors">
            📊 Relatórios
          </Link>
          <Link href="/funcionarios" className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm font-semibold transition-colors">
            + Equipe
          </Link>
          <Link href="/clientes" className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm font-semibold transition-colors">
            + Novo Cliente
          </Link>
          <Link href="/notas-fiscais" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-semibold transition-colors shadow-none">
            + Nova Nota Fiscal
          </Link>
          <div className="ml-4 border-l pl-4 border-gray-300">
            <UserButton />
          </div>
        </div>
      </header>

      <main>
        {/* --- CARDS DE MÉTRICAS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-yellow-400">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Bags na Rua (Pendentes)</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{totalPendentes} <span className="text-sm font-normal text-gray-500">un.</span></p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-red-500">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Bags Atrasadas</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{totalAtrasadas} <span className="text-sm font-normal text-gray-500">un.</span></p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-green-500">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Retornadas com Sucesso</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{totalRecebidas} <span className="text-sm font-normal text-gray-500">un.</span></p>
          </div>
        </div>

        <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden relative">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">Retorno de Embalagens por Nota Fiscal</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                  <th className="px-6 py-3 border-b">Nota Fiscal</th>
                  <th className="px-6 py-3 border-b">Cliente</th>
                  <th className="px-6 py-3 border-b">Bags Retornadas</th>
                  <th className="px-6 py-3 border-b">Prazo Limite</th>
                  <th className="px-6 py-3 border-b">Motorista/Técnico</th>
                  <th className="px-6 py-3 border-b">Status</th>
                  <th className="px-6 py-3 border-b text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="text-gray-700 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">Carregando dados...</td>
                  </tr>
                ) : embalagens.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">Nenhum registro encontrado.</td>
                  </tr>
                ) : (
                  embalagens.map((item) => {
                    const statusReal = getStatusReal(item); // O sistema toma a decisão linha por linha
                    return (
                      <tr key={item.id} className="hover:bg-gray-50 border-b last:border-0">
                        <td className="px-6 py-4 font-medium text-gray-900">{item.notaFiscal.numeroDaNota}</td>
                        <td className="px-6 py-4">{item.notaFiscal.cliente.nome}</td>
                        <td className="px-6 py-4">{item.quantidadeBags} un.</td>
                        <td className="px-6 py-4">{new Date(item.prazoLimite).toLocaleDateString("pt-BR")}</td>
                        <td className="px-6 py-4">{item.funcionarioRecebedor ? item.funcionarioRecebedor.nome : "—"}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(statusReal)}`}>
                            {statusReal.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {(statusReal === "PENDENTE" || statusReal === "ATRASADO") && (
                            <button
                              onClick={() => {
                                setEmbalagemSelecionada(item.id);
                                setModalAberta(true);
                              }}
                              className="px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded font-semibold text-xs transition-colors shadow-none"
                            >
                              Dar Baixa
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* MODAL MANTIDO INTACTO ABAIXO... */}
      {modalAberta && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-full max-w-md overflow-hidden text-gray-900">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Registrar Entrada de Bags</h3>
              <button onClick={fecharModal} className="text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
            </div>

            <form onSubmit={registrarBaixa} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade de Sacas *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formBaixa.quantidade}
                  onChange={(e) => setFormBaixa({ ...formBaixa, quantidade: e.target.value })}
                  className="w-full px-4 py-2 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Ex: 150"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Motorista / Técnico *</label>
                <select
                  required
                  value={formBaixa.funcionarioId}
                  onChange={(e) => setFormBaixa({ ...formBaixa, funcionarioId: e.target.value })}
                  className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="" disabled>Selecione quem trouxe...</option>
                  {funcionarios.map((func) => (
                    <option key={func.id} value={func.id}>{func.nome}</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={fecharModal}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 font-semibold text-sm transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loadingBaixa || !formBaixa.quantidade || !formBaixa.funcionarioId}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold text-sm transition-colors shadow-none disabled:bg-blue-400"
                >
                  {loadingBaixa ? "Salvando..." : "Confirmar Entrada"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}