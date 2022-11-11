// TODO: learn why this file is named this way. (topher)

import CredentialsProvider from "next-auth/providers/credentials";
import NextAuth from "next-auth/next";
import Moralis from "moralis";

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "MoralisAuth",
      credentials: {
        message: {
          label: "Message",
          type: "text",
          placeholder: "0x0",
        },
        signature: {
          label: "Signature",
          type: "text",
          placeholder: "0x0",
        },
      },
      async authorize(credentials) {
        try {
          // "message" and "signature" are needed for authorization we described
          // them in "credentials" above
          const { message, signature } = credentials;

          await Moralis.start({ apiKey: process.env.MORALIS_API_KEY });
          const { address, profileId } = (
            await await Moralis.Auth.verify({
              message,
              signature,
              network: "evm",
            })
          ).raw;

          const user = { address, profileId, signature };
          // return the user object and create a session
          return user;
        } catch (e) {
          console.error("error:", e);
          return null;
        }
      },
    }),
  ],
  // add user info to the user session object
  callbacks: {
    async jwt({ token, user }) {
      user && (token.user = user);
      return token;
    },
    async session({ session, token }) {
      session.user.token.user;
      return session;
    },
  },
});
