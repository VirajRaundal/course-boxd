import { NextResponse } from "next/server";
import { auth } from "./auth";

export default auth((request) => {
  if (!request.auth) {
    const redirectUrl = new URL("/login", request.nextUrl.origin);
    const callbackUrl = request.nextUrl.pathname + request.nextUrl.search;
    redirectUrl.searchParams.set("callbackUrl", callbackUrl);

    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/studio/:path*", "/account/:path*"],
};
