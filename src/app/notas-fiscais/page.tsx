"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";

interface Cliente {
  id: number;
  nome: string;
  cpfCnpj: string;
}

export default function NovaNotaFiscal() {
  const { getToken } = useAuth(); // Puxando o Clerk

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [formData, setFormData] = useState({
    numeroDaNota: "", dataEmissao: "", clienteId: "", quantidadeBags: "", prazoLimite: "",
  });
  const [mensagem, setMensagem] = useState({ texto: "", tipo: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const buscarClientes = async () => {
      try {
        const token = await getToken(); // Pega o token para carregar a lista suspensa
        const res = await fetch("http://localhost:8080/api/clientes", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setClientes(data);
        }
      } catch (err) {
        console.error("Erro ao buscar clientes:", err);
      }
    };
    buscarClientes();
  }, [getToken]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMensagem({ texto: "", tipo: "" });

    try {
      const token = await getToken();
      const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      };

      const payloadNF = {
        numeroDaNota: formData.numeroDaNota,
        dataEmissao: formData.dataEmissao,
        cliente: { id: Number(formData.clienteId) },
      };

      // 1. Tenta salvar a NF
      const resNF = await fetch("http://localhost:8080/api/notas-fiscais", {
        method: "POST", headers, body: JSON.stringify(payloadNF),
      });

      // NOVO: Tratamento específico para nota duplicada (Erro 409 Conflict)
      if (resNF.status === 409) {
        const erroJson = await resNF.json();
        throw new Error(erroJson.erro); // Lança o erro com o texto vindo do Java
      }

      // Se for outro erro diferente
      if (!resNF.ok) throw new Error("Erro desconhecido ao criar Nota Fiscal");

      const notaFiscalCriada = await resNF.json();

      // 2. Registra as embalagens
      const payloadBags = {
        quantidadeBags: Number(formData.quantidadeBags),
        status: "PENDENTE",
        prazoLimite: formData.prazoLimite,
        notaFiscal: { id: notaFiscalCriada.id },
      };

      const resBags = await fetch("http://localhost:8080/api/embalagens-retorno", {
        method: "POST", headers, body: JSON.stringify(payloadBags),
      });

      if (!resBags.ok) throw new Error("Erro ao registrar a saída das bags");

      setMensagem({ texto: "Nota Fiscal e saída de bags registradas com sucesso!", tipo: "sucesso" });
      setFormData({ numeroDaNota: "", dataEmissao: "", clienteId: "", quantidadeBags: "", prazoLimite: "" });

    } catch (error: any) {
      console.error("Erro:", error);
      // Aqui a mágica acontece: pegamos a mensagem exata do throw new Error
      setMensagem({ texto: error.message || "Ocorreu um erro na operação.", tipo: "erro" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans text-gray-900">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8 flex justify-between items-center border-b pb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Nova Nota Fiscal de Saída</h1>
            <p className="text-gray-600 mt-2 text-sm">Registre a saída dos produtos e defina o prazo para retorno das embalagens.</p>
          </div>
          <Link href="/" className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-sm font-semibold">
            Voltar ao Dashboard
          </Link>
        </header>

        <main className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
          {mensagem.texto && (
            <div className={`mb-6 p-4 rounded-md ${mensagem.tipo === "sucesso" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
              {mensagem.texto}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">1. Dados da Nota</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número da NF *</label>
                <input type="text" name="numeroDaNota" required value={formData.numeroDaNota} onChange={handleChange} className="w-full px-4 py-2 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors" placeholder="Ex: NF-001234" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data de Emissão *</label>
                <input type="date" name="dataEmissao" required value={formData.dataEmissao} onChange={handleChange} className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cliente Destino *</label>
              <select name="clienteId" required value={formData.clienteId} onChange={handleChange} className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors">
                <option value="" disabled>Selecione um cliente...</option>
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>{cliente.nome} ({cliente.cpfCnpj})</option>
                ))}
              </select>
            </div>

            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mt-8">2. Controle de Embalagens</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Qtd. de Bags Enviadas *</label>
                <input type="number" name="quantidadeBags" required min="1" value={formData.quantidadeBags} onChange={handleChange} className="w-full px-4 py-2 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors" placeholder="Ex: 50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prazo para Retorno *</label>
                <input type="date" name="prazoLimite" required value={formData.prazoLimite} onChange={handleChange} className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors" />
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex justify-end">
              <button type="submit" disabled={loading || clientes.length === 0} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors shadow-none disabled:bg-blue-400">
                {loading ? "Registrando Saída..." : "Confirmar Saída"}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}