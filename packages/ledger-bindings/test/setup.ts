import { resolve } from 'path';
import Zemu, { DEFAULT_START_OPTIONS, IStartOptions } from '@zondax/zemu';
import Transport from '@ledgerhq/hw-transport';

const SEED_PHRASE =
    'vendor sphere crew wise puppy wise stand wait tissue boy fortune myself hamster intact window garment negative dynamic permit genre limb work dial guess';

const options: IStartOptions = {
    sdk: '',
    caseSensitive: true,
    logging: true,
    startDelay: 3000,
    startTimeout: DEFAULT_START_OPTIONS.startTimeout,
    custom: `-s "${SEED_PHRASE}" `,
    startText: 'is ready',
    model: 'nanos',
    approveAction: 2,
    approveKeyword: 'approve',
    rejectKeyword: 'reject',
};

export const NANOS_ELF_PATH = resolve('../concordium-ledger-app/tests/bin/nanos/concordium_nanos.elf');

export function setupZemu(func: (sim: Zemu, transport: Transport) => Promise<void>) {
    return async () => {
        const sim = new Zemu(NANOS_ELF_PATH);
        const simOptions = options;

        try {
            await sim.start(simOptions);
            await func(sim, sim.getTransport());
        } finally {
            await sim.close();
        }
    };
}
