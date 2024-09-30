import { toNano } from '@ton/core';
import { UpTonMeta } from '../wrappers/UpTonMeta';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    // Check signer wallet balance before deployment
    const signerAddress = provider.sender().address;
    console.log('Signer address:', signerAddress);
    const upTonMeta = provider.open(await UpTonMeta.fromInit(BigInt(Math.floor(Math.random() * 10000))));

    await upTonMeta.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );
    console.log('Deploying...', upTonMeta.address);
    await provider.waitForDeploy(upTonMeta.address);
    console.log('ID', await upTonMeta.getId());
}
