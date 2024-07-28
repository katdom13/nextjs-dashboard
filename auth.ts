import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

const { auth, signIn, signOut } = NextAuth({
    ...authConfig
});
