import { CompilerConfig } from '@ton/blueprint';

export const compile: CompilerConfig = {
    lang: 'tact',
    target: 'contracts/up_ton_meta.tact',
    options: {
        debug: true,
    },
};
