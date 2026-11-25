import { auth } from "@/lib/auth/config";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session?.user;
  const role = session?.user?.role as string | undefined;

  const isAuthPage = nextUrl.pathname.startsWith("/login") || nextUrl.pathname.startsWith("/register");
  const isAdminPage = nextUrl.pathname.startsWith("/admin");
  const isStaffPage = nextUrl.pathname.startsWith("/staff");
  const isCustomerPage = nextUrl.pathname.startsWith("/customer");
  const isPublicPage =
    nextUrl.pathname === "/" ||
    nextUrl.pathname === "/about" ||
    nextUrl.pathname === "/services" ||
    nextUrl.pathname === "/contact";

  if (isPublicPage) return NextResponse.next();

  if (isAuthPage) {
    if (isLoggedIn) {
      if (role === "ADMIN") return NextResponse.redirect(new URL("/admin", nextUrl));
      if (role === "STAFF") return NextResponse.redirect(new URL("/staff", nextUrl));
      return NextResponse.redirect(new URL("/customer", nextUrl));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL(`/login?callbackUrl=${nextUrl.pathname}`, nextUrl));
  }

  if (isAdminPage && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }
  if (isStaffPage && role !== "STAFF" && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }
  if (isCustomerPage && role !== "CUSTOMER") {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
};
