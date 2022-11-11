import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { signIn } from "next-auth/react";
import { useAccount, useConnect, useSignMessage, useDisconnect } from "wagmi";
import { useRouter } from "next/router";
import axios from "axios";

function SignIn() {
  const { connectAsync } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const { isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { push } = useRouter();

  const handleAuth = async () => {
    // disconnect the web3 provider if it's already active
    if (isConnected) {
      await disconnectAsync();
    }

    // enable the web3 provider MetaMask
    const { account, chain, error } = await connectAsync({
      connector: new MetaMaskConnector(),
    });
    // TODO: figure out how to catch/display error message when MetaMask window:
    //   - cancelled
    //   - closed
    //   - minified
    const userData = { address: account, chain: chain.id, network: "evm" };
    console.log("userData:", userData);
    // make a post request to our 'request-message' endpoint
    const { data } = await axios.post("/api/auth/request-message", userData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    const message = data.message;
    // sign the received message via MetaMask:
    const signature = await signMessageAsync({ message });
    console.log("signature:", signature);

    // redirect user after success auth to "/user"
    const { url } = await signIn("credentials", {
      message,
      signature,
      redirect: false,
      callbackUrl: "/user",
    });
    // Instead of using `signIn(..., redirect: "/user")`,
    // we get the url from callback and push it to the router to avoid page
    // refreshing.
    push(url);
  };

  return (
    <div>
      <h3>Web3 Authentication</h3>
      <button onClick={() => handleAuth()}>Authenticate via MetaMask</button>
    </div>
  );
}

export default SignIn;
