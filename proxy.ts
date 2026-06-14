import { NextRequest, NextResponse } from "next/server";

// SEPARATION OF CONCERNS:
// The client-facing pages (/c/<moveId>, the /b/<boxId> scan redirect) and the
// box photos are PUBLIC. A customer reaches them via an unguessable share link
// or by scanning their box, with no login. EVERYTHING ELSE (the ops dashboard,
// the all-moves list, the per-box logger, the quoting data, and all /api routes)
// is the business side, gated behind a shared crew password. A client who holds
// a share link therefore cannot reach other clients' data or the business side.
//
// Next 16 renamed the "middleware" convention to "proxy"; same behavior.
const PUBLIC_PREFIXES = ["/c/", "/b/", "/uploads/"];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Client-facing and asset routes stay open.
  if (PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  const expected = process.env.OPS_PASSWORD;
  // If no password is configured, don't lock the crew out (local dev / first boot).
  // Production MUST set OPS_PASSWORD for the gate to be active.
  if (!expected) return NextResponse.next();

  const header = req.headers.get("authorization") ?? "";
  if (header.startsWith("Basic ")) {
    let decoded = "";
    try {
      decoded = atob(header.slice("Basic ".length));
    } catch {
      decoded = "";
    }
    // Format is "username:password"; we only check the password (shared crew login).
    const password = decoded.slice(decoded.indexOf(":") + 1);
    if (password === expected) return NextResponse.next();
  }

  // Header values must be plain ASCII, so keep this realm hyphenated, not em-dashed.
  return new NextResponse("Crew login required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="BoxTrack Ops", charset="UTF-8"' },
  });
}

// Run on everything except Next's own static assets.
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
