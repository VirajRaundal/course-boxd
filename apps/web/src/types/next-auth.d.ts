import type { DefaultSession } from "next-auth";
import type { VisibilityPreference } from "@prisma/client";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: DefaultSession["user"] & {
      id: string;
      username: string;
      avatarUrl: string | null;
      defaultVisibility: VisibilityPreference;
    };
  }

  interface User {
    id: string;
    email: string;
    username: string;
    avatarUrl: string | null;
    defaultVisibility: VisibilityPreference;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    avatarUrl: string | null;
    defaultVisibility: VisibilityPreference;
  }
}

declare module "@auth/core/adapters" {
  interface AdapterUser {
    username: string;
    avatarUrl: string | null;
    defaultVisibility: VisibilityPreference;
  }
}
