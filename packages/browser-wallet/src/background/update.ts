import { storedIdentities } from '@shared/storage/access';
import { Identity } from '@shared/storage/types';

const identityLock = 'Concordium_identity_lock';

export async function addIdentity(identity: Identity): Promise<void> {
    return navigator.locks.request(identityLock, async () => {
        const identities = (await storedIdentities.get()) || [];
        return storedIdentities.set(identities.concat(identity));
    });
}

export function updateIdentities(updatedIdentities: Identity[]) {
    return navigator.locks.request(identityLock, async () => {
        const currentIdentities = await storedIdentities.get();
        if (!currentIdentities) {
            return;
        }
        const newIdentities = [...currentIdentities];
        for (const identity of updatedIdentities) {
            const index = currentIdentities.findIndex((candidate) => identity.id === candidate.id);
            newIdentities[index] = identity;
        }
        await storedIdentities.set(newIdentities);
    });
}
