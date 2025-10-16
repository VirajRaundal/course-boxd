import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Email from "next-auth/providers/email";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@course-boxd/database";
import type { VisibilityPreference } from "@prisma/client";
import { compare } from "bcryptjs";
import { z } from "zod";

const emailFrom =
  process.env.EMAIL_FROM ?? "CourseBoxd <no-reply@courseboxd.app>";

let transporterPromise: Promise<import("nodemailer").Transporter> | null = null;

async function getTransporter() {
  if (!process.env.EMAIL_SERVER) {
    return null;
  }

  if (!transporterPromise) {
    transporterPromise = import("nodemailer").then(({ createTransport }) =>
      createTransport(process.env.EMAIL_SERVER!)
    );
  }

  return transporterPromise;
}

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "database",
  },
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: "/login",
    newUser: "/register",
  },
  providers: [
    Email({
      from: emailFrom,
      maxAge: 60 * 60, // 1 hour
      async sendVerificationRequest({ identifier, url }) {
        const transporter = await getTransporter();

        if (transporter) {
          await transporter.sendMail({
            to: identifier,
            from: emailFrom,
            subject: "CourseBoxd sign-in link",
            text: `Sign in to CourseBoxd\n${url}\n\nThis link will expire in one hour.`,
            html: `<p>Sign in to CourseBoxd</p><p><a href="${url}">Click here to finish signing in</a></p><p>This link will expire in one hour.</p>`,
          });
        } else {
          console.info(`Sign-in link for ${identifier}: ${url}`);
        }
      },
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        const passwordMatches = await compare(password, user.passwordHash);
        if (!passwordMatches) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
          avatarUrl: user.avatarUrl,
          defaultVisibility: user.defaultVisibility,
        } satisfies {
          id: string;
          email: string;
          name: string | null;
          username: string;
          avatarUrl: string | null;
          defaultVisibility: VisibilityPreference;
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id;
        session.user.email = user.email;
        session.user.name = user.name;
        session.user.username = user.username;
        session.user.avatarUrl = user.avatarUrl ?? null;
        session.user.defaultVisibility = user.defaultVisibility;
      }

      return session;
    },
  },
});
