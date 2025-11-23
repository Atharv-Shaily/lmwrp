import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { verifyPassword, hashPassword } from '@/lib/auth';

function normalizeRole(roleParam: any): 'customer' | 'retailer' | 'wholesaler' {
  const value = Array.isArray(roleParam) ? roleParam[0] : roleParam;
  if (value === 'retailer' || value === 'wholesaler' || value === 'customer') {
    return value;
  }
  return 'customer';
}

async function handleOAuthSignIn(
  user: any,
  account: any,
  roleFromRequest?: 'customer' | 'retailer' | 'wholesaler'
): Promise<boolean> {
  if (account?.provider === 'google' || account?.provider === 'facebook') {
    await connectDB();
    const existingUser = await User.findOne({
      $or: [
        { email: user.email },
        { 'socialAuth.providerId': account.providerAccountId },
      ],
    });

    if (!existingUser) {
      const roleToUse = roleFromRequest || 'customer';

      const createdUser = await User.create({
        name: user.name,
        email: user.email,
        role: roleToUse,
        isVerified: true,
        socialAuth: {
          provider: account.provider as 'google' | 'facebook',
          providerId: account.providerAccountId,
        },
      });

      (user as any).role = createdUser.role;
      (user as any).id = createdUser._id.toString();
    } else {
      (user as any).role = existingUser.role;
      (user as any).id = existingUser._id.toString();

      if (!existingUser.socialAuth) {
        existingUser.socialAuth = {
          provider: account.provider as 'google' | 'facebook',
          providerId: account.providerAccountId,
        };
        existingUser.isVerified = true;
        await existingUser.save();
      }
    }
  }

  return true;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        await connectDB();
        const user = await User.findOne({ email: credentials.email });

        if (!user || !user.password) {
          throw new Error('Invalid credentials');
        }

        const isValid = await verifyPassword(credentials.password, user.password);

        if (!isValid) {
          throw new Error('Invalid credentials');
        }

        if (!user.isVerified) {
          throw new Error('Please verify your email first');
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          businessName: user.businessName,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      return handleOAuthSignIn(user, account);
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.role = (user as any).role;
        token.id = (user as any).id;
        (token as any).businessName = (user as any).businessName;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
        (session.user as any).businessName = (token as any).businessName;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  const roleFromRequest = normalizeRole(req.query.role);

  return NextAuth(req, res, {
    ...authOptions,
    callbacks: {
      ...authOptions.callbacks,
      async signIn({ user, account, profile }) {
        return handleOAuthSignIn(user, account, roleFromRequest);
      },
    },
  });
}






