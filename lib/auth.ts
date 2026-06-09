import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getNeo4jDriver } from "./neo4j";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        companyCode: { label: "Company Code", type: "text" },
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Missing username or password");
        }

        const driver = getNeo4jDriver();
        const session = driver.session();

        try {
          let result;
          if (credentials.companyCode) {
            // Employee Login
            result = await session.run(
              `
              MATCH (u:User {username: $username, role: 'employee'})-[:BELONGS_TO]->(c:Company {companyCode: $companyCode})
              RETURN u, c.companyCode AS companyCode, c.name AS companyName
              `,
              { username: credentials.username, companyCode: credentials.companyCode }
            );
          } else {
            // Admin Login
            result = await session.run(
              `
              MATCH (u:User {username: $username, role: 'admin'})-[:BELONGS_TO]->(c:Company)
              RETURN u, c.companyCode AS companyCode, c.name AS companyName
              `,
              { username: credentials.username }
            );
          }

          if (result.records.length === 0) {
            throw new Error("Invalid username or password");
          }

          const record = result.records[0];
          const userNode = record.get("u").properties;
          const companyCode = record.get("companyCode");
          const companyName = record.get("companyName");

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            userNode.passwordHash
          );

          if (!isPasswordValid) {
            throw new Error("Invalid username or password");
          }

          return {
            id: userNode.username,
            name: userNode.username,
            role: userNode.role,
            companyCode: companyCode || undefined,
            companyName: companyName || undefined
          };
        } finally {
          await session.close();
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.companyCode = user.companyCode;
        token.companyName = user.companyName;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub as string;
        session.user.role = token.role as string;
        session.user.companyCode = token.companyCode as string;
        session.user.companyName = token.companyName as string;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/admin/login",
  }
};
