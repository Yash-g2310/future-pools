import { createClient, configureChains, mainnet, goerli } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';

const { chains, provider } = configureChains(
  [mainnet, goerli],
  [publicProvider()]
);

export const wagmiClient = createClient({
  autoConnect: true,
  provider,
});

export { chains };