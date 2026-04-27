import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// IMPORTANT: Use 'export default' for the proxy function in Next.js 16
export default async function proxy(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers
        });

        if (!session) {
            return NextResponse.redirect(new URL("/login", request.url));
        }

        return NextResponse.next();
    } catch (error) {
        console.error("Proxy Auth Error:", error);
        return NextResponse.next(); // Fail open or redirect to login
    }
}

export const config = {
    matcher: ["/chat/:path*"],
};