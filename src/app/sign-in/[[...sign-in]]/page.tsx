import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Mig-RECICLA</h1>
        <p className="text-gray-600 mt-2 text-sm">Faça login para acessar o painel operacional</p>
      </div>
      
      {/* O componente mágico do Clerk faz todo o trabalho pesado aqui */}
      <SignIn />
    </div>
  );
}