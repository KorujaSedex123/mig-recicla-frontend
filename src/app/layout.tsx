import { ClerkProvider } from '@clerk/nextjs';
import { ptBR } from '@clerk/localizations';
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mig-RECICLA | Operações Logísticas",
  description: "Painel de controle para retorno de embalagens",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider 
      localization={ptBR}
      appearance={{
        variables: {
          colorPrimary: '#2563eb', // Azul padrão do nosso sistema (blue-600)
          colorForeground: '#111827', // Texto escuro (gray-900)
          colorBackground: '#ffffff', // Fundo dos cartões branco
          colorInput: '#ffffff', // Fundo dos inputs
          colorInputForeground: '#111827', // Texto dentro do input
          borderRadius: '0.375rem', // Borda levemente arredondada (rounded-md)
        },
        elements: {
          // Podemos injetar classes do Tailwind diretamente nos elementos do Clerk!
          card: "shadow-sm border border-gray-200",
          formButtonPrimary: "font-semibold transition-colors shadow-none",
          footerActionLink: "text-blue-600 hover:text-blue-700",
        }
      }}
    >
      <html lang="pt-BR">
        <body className="bg-gray-50 font-sans text-gray-900 antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}