"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";

export default function CadastroFuncionario() {
  const { getToken } = useAuth();

  // Atualizado com todos os campos exigidos pela API Java
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    cargo: "",
    setor: "",
  });
  
  const [mensagem, setMensagem] = useState({ texto: "", tipo: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMensagem({ texto: "", tipo: "" });

    try {
      const token = await getToken();

      const res = await fetch("http://localhost:8080/api/funcionarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setMensagem({ texto: "Membro da equipe cadastrado com sucesso!", tipo: "sucesso" });
        // Limpa todos os campos após o cadastro
        setFormData({ nome: "", email: "", cargo: "", setor: "" }); 
      } else {
        setMensagem({ texto: "Erro ao cadastrar funcionário. Verifique se o e-mail já existe.", tipo: "erro" });
      }
    } catch (error) {
      console.error("Erro:", error);
      setMensagem({ texto: "Erro de conexão com o servidor.", tipo: "erro" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans text-gray-900">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8 flex justify-between items-center border-b pb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Novo Membro da Equipe</h1>
            <p className="text-gray-600 mt-2 text-sm">
              Cadastre os motoristas e técnicos responsáveis pelo recolhimento das bags.
            </p>
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  name="nome"
                  required
                  value={formData.nome}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  placeholder="Ex: Emerson Lissarassa"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail *</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  placeholder="email@empresa.com.br"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
                <input
                  type="text"
                  name="cargo"
                  value={formData.cargo}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  placeholder="Ex: Motorista"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Setor</label>
                <input
                  type="text"
                  name="setor"
                  value={formData.setor}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  placeholder="Ex: Logística"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                disabled={loading || !formData.nome || !formData.email}
                className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors shadow-none disabled:bg-blue-400"
              >
                {loading ? "Salvando..." : "Salvar Membro"}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}