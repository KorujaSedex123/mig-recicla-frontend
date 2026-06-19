import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define quais rotas são públicas (as de login/cadastro)
const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  // Extraímos o ID do usuário logado e a função de redirecionamento
  const { userId, redirectToSignIn } = await auth();

  if (!isPublicRoute(request) && !userId) {
    return redirectToSignIn();
  }
});

export const config = {
  matcher: [
    // Pula arquivos internos do Next.js e arquivos estáticos
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Sempre roda para rotas de API
    "/(api|trpc)(.*)",
  ],
};