"use client";

import { useEffect, useState } from "react";

// Definindo a estrutura de dados que vem do nosso backend Java
interface Embalagem {
  id: number;
  quantidadeBags: number;
  status: string;
  prazoLimite: string;
  dataRecebimento: string | null;
  notaFiscal: {
    numeroDaNota: string;
    cliente: {
      nome: string;
    };
  };
  funcionarioRecebedor: {
    nome: string;
  } | null;
}

export default function Dashboard() {
  const [embalagens, setEmbalagens] = useState<Embalagem[]>([]);
  const [loading, setLoading] = useState(true);

  // --- CHECKBOX 2: Consumir API do Spring Boot ---
  useEffect(() => {
    fetch("http://localhost:8080/api/embalagens-retorno")
      .then((res) => res.json())
      .then((data) => {
        setEmbalagens(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao buscar dados do Spring Boot:", err);
        setLoading(false);
      });
  }, []);

  // Função para estilizar os status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "RECEBIDO_NUTRIGUACU":
        return "bg-green-100 text-green-800";
      case "PENDENTE":
        return "bg-yellow-100 text-yellow-800";
      case "ATRASADO":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    // --- CHECKBOX 3: Interface limpa, focada em operações e vendas ---
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <header className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Operações Logísticas</h1>
        <p className="text-gray-600 mt-2 text-sm">
          Painel de controle focado em suporte técnico e acompanhamento do pós-venda.
        </p>
      </header>

      <main>
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
          
          {/* Cabeçalho da Tabela */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">
              {/* --- CHECKBOX 1: Tela de listagem de NFs e status --- */}
              Retorno de Embalagens por Nota Fiscal
            </h2>
          </div>

          {/* Tabela */}
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
                </tr>
              </thead>
              <tbody className="text-gray-700 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      Carregando dados do servidor...
                    </td>
                  </tr>
                ) : embalagens.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      Nenhum registro encontrado.
                    </td>
                  </tr>
                ) : (
                  embalagens.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 border-b last:border-0">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {item.notaFiscal.numeroDaNota}
                      </td>
                      <td className="px-6 py-4">{item.notaFiscal.cliente.nome}</td>
                      <td className="px-6 py-4">{item.quantidadeBags} un.</td>
                      <td className="px-6 py-4">
                        {new Date(item.prazoLimite).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-6 py-4">
                        {item.funcionarioRecebedor ? item.funcionarioRecebedor.nome : "Pendente"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            item.status
                          )}`}
                        >
                          {item.status.replace("_", " ")}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}