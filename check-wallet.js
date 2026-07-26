const { Wallet, Contract, parseUnits, formatUnits, formatEther } = require('ethers');

const MNEMONIC = 'cat address gloom raw retire muffin success actress disagree bus credit cloth';
const wallet = Wallet.fromPhrase(MNEMONIC);

console.log('Wallet:', wallet.address);
console.log('');

const RPCs = {
  ethereum: [
    'https://eth.llamarpc.com',
    'https://rpc.ankr.com/eth',
    'https://ethereum.blockpi.network/v1/rpc/public',
  ],
  base: [
    'https://mainnet.base.org',
    'https://base.llamarpc.com',
    'https://base.meowrpc.com',
  ],
};

const USDC_BASE = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const BASE_BRIDGE = '0x49048044D57e1C92A77f79988d21Fa8fAF74E97e';

const ERC20_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
];

async function fetchRPC(chain, method, params) {
  const urls = RPCs[chain];
  for (const url of urls) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', method, params, id: 1 }),
        timeout: 15000,
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      return data.result;
    } catch (e) {
      continue;
    }
  }
  throw new Error(`All ${chain} RPCs failed`);
}

async function getEthBalance(chain) {
  const result = await fetchRPC(chain, 'eth_getBalance', [wallet.address, 'latest']);
  return formatEther(result);
}

async function getTokenBalance(chain, tokenAddress) {
  const data = '0x70a08231000000000000000000000000' + wallet.address.slice(2).toLowerCase();
  const result = await fetchRPC(chain, 'eth_call', [{ to: tokenAddress, data }, 'latest']);
  const decimalsData = '0x313ce567';
  const decimalsResult = await fetchRPC(chain, 'eth_call', [{ to: tokenAddress, data: decimalsData }, 'latest']);
  const decimals = parseInt(decimalsResult, 16);
  const balance = BigInt(result);
  return Number(balance) / (10 ** decimals);
}

async function main() {
  console.log('=== BALANCES ===\n');
  
  try {
    const eth = await getEthBalance('ethereum');
    console.log(`Ethereum ETH: ${parseFloat(eth).toFixed(6)} ETH (~$${(parseFloat(eth) * 3500).toFixed(2)})`);
  } catch (e) { console.log('Ethereum error:', e.message); }
  
  try {
    const baseEth = await getEthBalance('base');
    console.log(`Base ETH: ${parseFloat(baseEth).toFixed(6)} ETH`);
  } catch (e) { console.log('Base error:', e.message); }
  
  try {
    const usdc = await getTokenBalance('base', USDC_BASE);
    console.log(`Base USDC: ${usdc.toFixed(6)} USDC`);
  } catch (e) { console.log('USDC error:', e.message); }
}

main().catch(console.error);
