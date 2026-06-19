"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";

interface Embalagem {
  id: number;
  quantidadeBags: number; 
  quantidadeRetornada: number | null; 
  status: string;
  prazoLimite: string;
  dataRecebimento: string | null;
  notaFiscal: {
    numeroDaNota: string;
    cliente: { nome: string; };
  };
  funcionarioRecebedor: { nome: string; } | null;
}

export default function RelatorioBags() {
  const { getToken } = useAuth();
  const [embalagens, setEmbalagens] = useState<Embalagem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const buscarDados = async () => {
      try {
        const token = await getToken();
        const res = await fetch("http://localhost:8080/api/embalagens-retorno", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setEmbalagens(data);
        }
      } catch (err) {
        console.error("Erro ao carregar relatório:", err);
      } finally {
        setLoading(false);
      }
    };
    buscarDados();
  }, [getToken]);

  const totalEnviado = embalagens.reduce((acc, curr) => acc + curr.quantidadeBags, 0);
  
  const totalRetornado = embalagens
    .filter(e => e.status === "RECEBIDO_NUTRIGUACU")
    .reduce((acc, curr) => acc + (curr.quantidadeRetornada || 0), 0); 

  const saldoPendenteTotal = totalEnviado - totalRetornado;
  const taxaRetorno = totalEnviado > 0 ? ((totalRetornado / totalEnviado) * 100).toFixed(1) : "0.0";

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans text-gray-900">
      <div className="max-w-6xl mx-auto">
        
        <header className="mb-8 flex justify-between items-center border-b pb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Relatório de Conferência de Bags</h1>
            <p className="text-gray-600 mt-2 text-sm">
              Análise quantitativa de saídas, retornos e quebras de embalagens no campo.
            </p>
          </div>
          <Link href="/" className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-sm font-semibold">
            Voltar ao Dashboard
          </Link>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-xs font-medium text-gray-500 uppercase">Total Enviado</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totalEnviado} un.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-xs font-medium text-gray-500 uppercase">Total Retornado</h3>
            <p className="text-2xl font-bold text-green-600 mt-1">{totalRetornado} un.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-xs font-medium text-gray-500 uppercase">Saldo em Aberto</h3>
            <p className="text-2xl font-bold text-yellow-600 mt-1">{saldoPendenteTotal} un.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-xs font-medium text-gray-500 uppercase">Índice de Devolução</h3>
            <p className="text-2xl font-bold text-blue-600 mt-1">{taxaRetorno}%</p>
          </div>
        </div>

        <main className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Detalhamento por Nota Fiscal</h2>
            <button 
              onClick={() => window.print()} 
              className="px-3 py-1 bg-white border text-gray-700 rounded hover:bg-gray-50 text-xs font-semibold shadow-none transition-colors"
            >
              Imprimir Relatório
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider border-b">
                  <th className="px-6 py-3">NF</th>
                  <th className="px-6 py-3">Cliente</th>
                  <th className="px-6 py-3 text-center">Enviadas</th>
                  <th className="px-6 py-3 text-center">Retornadas</th>
                  <th className="px-6 py-3 text-center">Divergência</th>
                  <th className="px-6 py-3">Responsável</th> {/* <-- NOVA COLUNA AQUI */}
                  <th className="px-6 py-3">Status Real</th>
                </tr>
              </thead>
              <tbody className="text-gray-700 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">Gerando relatório estatístico...</td>
                  </tr>
                ) : embalagens.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">Nenhum registro para exibir.</td>
                  </tr>
                ) : (
                  embalagens.map((item) => {
                    const enviadas = item.quantidadeBags;
                    const retornadas = item.status === "RECEBIDO_NUTRIGUACU" ? (item.quantidadeRetornada || 0) : 0; 
                    const diferenca = enviadas - retornadas;

                    return (
                      <tr key={item.id} className="hover:bg-gray-50 border-b last:border-0">
                        <td className="px-6 py-4 font-medium text-gray-900">{item.notaFiscal.numeroDaNota}</td>
                        <td className="px-6 py-4">{item.notaFiscal.cliente.nome}</td>
                        <td className="px-6 py-4 text-center font-medium">{enviadas} un.</td>
                        <td className="px-6 py-4 text-center text-green-600 font-medium">{retornadas} un.</td>
                        <td className="px-6 py-4 text-center">
                          {diferenca > 0 && item.status === "RECEBIDO_NUTRIGUACU" ? (
                            <span className="text-red-600 font-bold">-{diferenca} un.</span>
                          ) : diferenca > 0 ? (
                            <span className="text-gray-400 italic">Pendente ({diferenca})</span>
                          ) : (
                            <span className="text-green-600 font-semibold">✔ Ok</span>
                          )}
                        </td>
                        
                        {/* AQUI MOSTRAMOS QUEM TROUXE AS BAGS */}
                        <td className="px-6 py-4 text-gray-700 font-medium">
                          {item.funcionarioRecebedor ? item.funcionarioRecebedor.nome : <span className="text-gray-400 italic">Aguardando</span>}
                        </td>
                        
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            item.status === "RECEBIDO_NUTRIGUACU" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {item.status.replace("_", " ")}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}