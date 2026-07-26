const ethers = require('ethers');

const SEED_PHRASE = 'cat address gloom raw retire muffin success actress disagree bus credit cloth';
const WALLET2 = '0x0c1fa40d4600081270c931811587d68af18b0b94';
const RECIPIENT = '0x7B8401b5B4ee319aa47DC5F12b869e5Be460A9B2';

const RPC_URLS = [
  'https://mainnet.base.org',
  'https://base.llamarpc.com',
  'https://base-rpc.publicnode.com',
  'https://base.meowrpc.com',
];

const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

const USDC_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function transferWithAuthorization(address from, address to, uint256 value, uint256 validAfter, uint256 validBefore, bytes32 nonce, bytes signature) external returns (bool)',
];

async function getProvider() {
  for (const url of RPC_URLS) {
    try {
      const provider = new ethers.JsonRpcProvider(url);
      await provider.getBlockNumber();
      console.log(`Connected to RPC: ${url}`);
      return provider;
    } catch (e) {
      console.log(`RPC failed: ${url} - ${e.message.substring(0, 60)}`);
    }
  }
  throw new Error('No working RPC');
}

async function main() {
  const wallet = ethers.Wallet.fromPhrase(SEED_PHRASE);
  console.log('Wallet:', wallet.address);
  console.log('Recipient:', RECIPIENT);

  const provider = await getProvider();
  const connectedWallet = wallet.connect(provider);

  const ethBalance = await provider.getBalance(wallet.address);
  console.log(`\nETH Balance: ${ethers.formatEther(ethBalance)} ETH`);

  const usdc = new ethers.Contract(USDC_ADDRESS, USDC_ABI, provider);
  const usdcBalance = await usdc.balanceOf(wallet.address);
  const decimals = await usdc.decimals();
  console.log(`USDC Balance: ${ethers.formatUnits(usdcBalance, decimals)} USDC`);

  const ethBalanceRecipient = await provider.getBalance(RECIPIENT);
  const usdcBalanceRecipient = await usdc.balanceOf(RECIPIENT);
  console.log(`\nRecipient ETH: ${ethers.formatEther(ethBalanceRecipient)} ETH`);
  console.log(`Recipient USDC: ${ethers.formatUnits(usdcBalanceRecipient, decimals)} USDC`);

  const ethBalance2 = await provider.getBalance(WALLET2);
  const usdcBalance2 = await usdc.balanceOf(WALLET2);
  console.log(`\nWallet2 (${WALLET2}):`);
  console.log(`ETH: ${ethers.formatEther(ethBalance2)} ETH`);
  console.log(`USDC: ${ethers.formatUnits(usdcBalance2, decimals)} USDC`);
}

main().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
