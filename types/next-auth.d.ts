import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
    companyCode?: string;
    companyName?: string;
  }

  interface Session {
    user: {
      id?: string;
      role?: string;
      companyCode?: string;
      companyName?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    companyCode?: string;
    companyName?: string;
  }
}
