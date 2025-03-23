import { AuthOptions } from "next-auth";
 import CredentialsProvider from "next-auth/providers/credentials";
 import userLogIn from "@/libs/userLogIn"

 export const authOptions: AuthOptions ={
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
              email: { label: "Email", type: "email", placeholder: "User email" },
              password: { label: "Password", type: "password", placeholder: "User password"}
            },
            async authorize(credentials, req) {
              if(!credentials)return null
                const data = await userLogIn(credentials.email , credentials.password);
              if (data) {
                return data
              } else {
                return null
              }
            }
          })
    ],
    session: {strategy: "jwt"},
    callbacks: {
        async jwt({token, user}){
            return {...token, ...user}
        },
        async session({session, token, user}){
            session.user = token as any;
            return session;
        },
    },
 };