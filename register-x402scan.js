const ethers = require('ethers');
const axios = require('axios');

const SEED_PHRASE = 'cat address gloom raw retire muffin success actress disagree bus credit cloth';
const ORIGIN = 'https://afaagent-x402-api.storm-fly.workers.dev';
const X402SCAN_URL = 'https://x402scan.com/api/x402/registry/register-origin';

async function main() {
  const wallet = ethers.Wallet.fromPhrase(SEED_PHRASE);
  console.log('Wallet:', wallet.address);

  console.log('\n=== Step 1: POST to get 402 challenge ===');
  let challengeData = null;
  try {
    const resp = await axios.post(X402SCAN_URL, { origin: ORIGIN }, { timeout: 15000 });
    console.log('Unexpected success:', JSON.stringify(resp.data, null, 2));
    return;
  } catch (e) {
    console.log('Status:', e.response?.status);
    challengeData = e.response?.data;
  }

  const siwxExt = challengeData.extensions?.['sign-in-with-x'];
  const info = siwxExt.info || {};
  const domain = info.domain;
  const uri = info.uri;
  const nonce = info.nonce;
  const issuedAt = info.issuedAt;
  const expirationTime = info.expirationTime;
  const chainId = siwxExt.supportedChains?.[0]?.chainId || 'eip155:8453';
  const statement = info.statement;
  const version = info.version;

  const chainNum = chainId.split(':')[1];

  const siweMessage = `${domain} wants you to sign in with your Ethereum account:
${wallet.address}

${statement}

URI: ${uri}
Version: ${version}
Chain ID: ${chainNum}
Nonce: ${nonce}
Issued At: ${issuedAt}
Expiration Time: ${expirationTime}
Resources:
- ${ORIGIN}`;

  console.log('\n=== Step 2: Sign SIWE message ===');
  console.log('Message:\n' + siweMessage + '\n');
  const signature = await wallet.signMessage(siweMessage);
  console.log('Signature:', signature.substring(0, 30) + '...');

  const siwxPayload = {
    domain,
    address: wallet.address,
    uri,
    version,
    chainId,
    type: 'eip191',
    nonce,
    issuedAt,
    expirationTime,
    statement,
    resources: [ORIGIN],
    signatureScheme: 'eip191',
    signature,
  };

  const authHeader = Buffer.from(JSON.stringify(siwxPayload)).toString('base64');

  console.log('\n=== Step 3: Register with SIWX ===');
  try {
    const regResp = await axios.post(X402SCAN_URL,
      { origin: ORIGIN },
      {
        headers: {
          'Content-Type': 'application/json',
          'SIGN-IN-WITH-X': authHeader,
        },
        timeout: 60000,
      }
    );
    console.log('\n✅ Registration successful!');
    console.log('Response:', JSON.stringify(regResp.data, null, 2));
  } catch (regErr) {
    console.log('\n❌ Registration failed:');
    console.log('Status:', regErr.response?.status);
    console.log('Data:', JSON.stringify(regErr.response?.data, null, 2));
  }
}

main();
