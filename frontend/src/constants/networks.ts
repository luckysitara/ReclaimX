export const SUPPORTED_CHAINS = {
  ETHEREUM: {
    chainId: 1,
    name: "Ethereum Mainnet",
    rpcUrl: "https://rpc.ankr.com/eth",
    explorerUrl: "https://etherscan.io",
    layerZeroEid: 30101,
    layerZeroEndpoint: "0x1a44076050125825900e736c501f859c50fe728c",
  },
  SEPOLIA: {
    chainId: 11155111,
    name: "Sepolia Testnet",
    rpcUrl: "https://rpc.sepolia.org",
    explorerUrl: "https://sepolia.etherscan.io",
    layerZeroEid: 40161,
    layerZeroEndpoint: "0x6EDCE65403992e310A62460808c4b910D972f10f",
  },
  POLYGON: {
    chainId: 137,
    name: "Polygon",
    rpcUrl: "https://rpc.ankr.com/polygon",
    explorerUrl: "https://polygonscan.com",
    layerZeroEid: 30109,
    layerZeroEndpoint: "0x1a44076050125825900e736c501f859c50fe728c",
  },
  ARBITRUM: {
    chainId: 42161,
    name: "Arbitrum One",
    rpcUrl: "https://rpc.ankr.com/arbitrum",
    explorerUrl: "https://arbiscan.io",
    layerZeroEid: 30110,
    layerZeroEndpoint: "0x1a44076050125825900e736c501f859c50fe728c",
  },
} as const

export const SOLANA_NETWORKS = {
  MAINNET: {
    name: "Solana Mainnet",
    rpcUrl: "https://api.mainnet-beta.solana.com",
    explorerUrl: "https://explorer.solana.com",
    layerZeroEid: 30168,
    layerZeroEndpoint: "H3SKp4cL5rpzJDntDa2umKE9AHkGiyss1W8BNDndhHWp",
    cluster: "mainnet-beta",
  },
  DEVNET: {
    name: "Solana Devnet",
    rpcUrl: "https://api.devnet.solana.com",
    explorerUrl: "https://explorer.solana.com",
    layerZeroEid: 40168,
    layerZeroEndpoint: "76y77prsiCMvXMjuoZ5VRrhG5qYBrUMYTE5WgHqgjEn6",
    cluster: "devnet",
  },
} as const

export function getChainConfig(chainId: number) {
  return Object.values(SUPPORTED_CHAINS).find((chain) => chain.chainId === chainId)
}

export function isValidChain(chainId: number): boolean {
  return Object.values(SUPPORTED_CHAINS).some((chain) => chain.chainId === chainId)
}
