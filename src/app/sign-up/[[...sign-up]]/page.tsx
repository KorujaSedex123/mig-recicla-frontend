import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Mig-RECICLA</h1>
        <p className="text-gray-600 mt-2 text-sm">Crie sua conta para acessar o sistema</p>
      </div>
      
      <SignUp />
    </div>
  );
}