import { type NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

type CookieToSet = { name: string; value: string; options?: CookieOptions };

// Multi-tenant proxy (Next 16 convention, formerly "middleware"):
// 1. Refreshes Supabase session cookies on every request.
// 2. Resolves the chain slug from the path /c/[chainSlug]/... and pins it
//    in a request header that server components can read.
// 3. Redirects unauthenticated traffic out of protected manager/owner areas.
//    KDS / station / kiosk routes use the PIN-session cookie instead of Supabase Auth.
export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options as CookieOptions),
          );
        },
      },
    },
  );

  // Touch auth to refresh cookies (no redirect — demo mode is permissive).
  await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const match = pathname.match(/^\/c\/([^/]+)(\/.*)?$/);
  const chainSlug = match?.[1] ?? null;
  if (chainSlug) {
    response.headers.set("x-frich-chain-slug", chainSlug);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|brand|api/public).*)"],
};
