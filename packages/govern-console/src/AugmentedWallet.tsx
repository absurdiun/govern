/* eslint-disable */
import React, { useContext, useMemo } from 'react';
import { ethers, providers as EthersProviders } from 'ethers';
import { UseWalletProvider, useWallet } from 'use-wallet';
import { Account } from 'utils/types';
import { INFURA_PROJECT_ID } from 'utils/constants';

const WalletAugmentedContext = React.createContext({});

function useWalletAugmented() {
  return useContext(WalletAugmentedContext);
}

// Adds Ethers.js to the useWallet() object
const WalletAugmented: React.FC<unknown> = ({ children }) => {
  const wallet = useWallet();
  const ethereum: any = wallet.ethereum;
  const fallbackProvider = ethers.getDefaultProvider('rinkeby', {
    infura: INFURA_PROJECT_ID,
  });
  const [provider, updateProvider] = React.useState(fallbackProvider);
  const injectedProvider = useMemo(
    () => (ethereum ? new EthersProviders.Web3Provider(ethereum) : null),
    [ethereum],
  );

  React.useEffect(() => {
    if (injectedProvider) {
      updateProvider(injectedProvider);
    } else {
      updateProvider(fallbackProvider);
    }
  }, [injectedProvider]);

  const contextValue = useMemo(() => {
    let signer = undefined;
    if (injectedProvider) {
      signer = injectedProvider.getSigner();
    }
    const account: Account = {
      address: wallet.account,
      signer,
    };

    return {
      ...wallet,
      isConnected: wallet.status === 'connected',
      provider,
      account,
    };
  }, [wallet, provider]);
  return (
    <WalletAugmentedContext.Provider value={contextValue}>
      {children}
    </WalletAugmentedContext.Provider>
  );
};

const WalletProvider: React.FC<unknown> = ({ children }) => {
  return (
    <UseWalletProvider chainId={4}>
      <WalletAugmented>{children}</WalletAugmented>
    </UseWalletProvider>
  );
};

export { useWalletAugmented as useWallet, WalletProvider };
