/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/no-extraneous-dependencies */
import {
    AccountAddress,
    AccountTransaction,
    AccountTransactionType,
    AccountTransactionPayload,
    buildBasicAccountSigner,
    getAccountTransactionHash,
    CcdAmount,
    ConcordiumGRPCClient,
    signTransaction,
    SimpleTransferPayload,
    TransactionExpiry,
    AccountInfo,
    ChainParameters,
    ChainParametersV0,
    BakerPoolStatusDetails,
    InitContractPayload,
    UpdateContractPayload,
    SimpleTransferWithMemoPayload,
    AccountInfoType,
    convertEnergyToMicroCcd,
    getEnergyCost,
    CredentialSignature,
    AccountTransactionSignature,
    // getAccountAddress,
} from '@concordium/web-sdk';
import {
    isValidResolutionString,
    ccdToMicroCcd,
    displayAsCcd,
    fractionalToInteger,
    isValidCcdString,
    getPublicAccountAmounts,
} from 'wallet-common-helpers';

import i18n from '@popup/shell/i18n';
import { useAtomValue } from 'jotai';
import { addPendingTransactionAtom, selectedPendingTransactionsAtom } from '@popup/store/transactions';
import { DEFAULT_TRANSACTION_EXPIRY } from '@shared/constants/time';
import { useCallback } from 'react';
import { grpcClientAtom } from '@popup/store/settings';
import { useUpdateAtom } from 'jotai/utils';

/** Imported concordium ledger app */
import { Buffer } from 'buffer';
import TransportWebHID from '@ledgerhq/hw-transport-webhid';
import Concordium from '@blooo/hw-app-concordium';
import Transport from '@ledgerhq/hw-transport';
import { BrowserWalletAccountTransaction, TransactionStatus } from './transaction-history-types';
import { usePrivateKey } from './account-helpers';
import { useBlockChainParameters } from '../BlockChainParametersProvider';

window.Buffer = Buffer;

// buffer.js 519 code triggered by utils.ts 199

export function buildSimpleTransferPayload(recipient: string, amount: bigint): SimpleTransferPayload {
    return {
        toAddress: AccountAddress.fromBase58(recipient),
        amount: CcdAmount.fromMicroCcd(amount),
    };
}

let ledgerTransport: Transport | null = null;

export function convertToAccountTransactionSignature(signature: string): AccountTransactionSignature {
    const credentialSignature: CredentialSignature = {
        0: signature,
    };

    const accountTransactionSignature: AccountTransactionSignature = {
        0: credentialSignature,
    };

    return accountTransactionSignature;
}

export async function sendTransaction(
    client: ConcordiumGRPCClient,
    transaction: AccountTransaction,
    signingKey: string
): Promise<string> {
    if (!ledgerTransport) {
        try {
            console.log('New Connection Ledger device');
            ledgerTransport = await TransportWebHID.create();
        } catch (error: any) {
            console.error('Ledger connection error:', error);
        }
    } else {
        console.log('Reusing existing ledger device connection');
    }

    try {
        // const ledgerTransport = await TransportWebHID.create();
        const ccd = new Concordium(ledgerTransport);
        // console.log(ccd);

        const pathString = `44/919/0/0/0/0`;

        const { publicKey } = await ccd.getPublicKey(pathString);
        console.log(publicKey);

        // const accountAddress = getAccountAddress(publicKey).address;
        // const address = AccountAddress.fromBase58(accountAddress.toString());

        // console.log('Ledger Account Address:', address);
        // console.log('Sender Address:', transaction.header.sender);

        /* const credentialValues = {
            credId: '838b23de26014937257d22665a2897377d9b3ae2c99b6149e420b1e9880f8603583bb950e12a652f4ec754606f9470c2',
            ipIdentity: 0,
            revocationThreshold: 2,
            credentialPublicKeys: {
                keys: {
                    1: {
                        schemeId: 'Ed25519',
                        verifyKey: 'f78929ec8a9819f6ae2e10e79522b6b311949635fecc3d924d9d1e23f8e9e1c3',
                    },
                }, // Record<number, VerifyKey>,
                threshold: 2,
            },
            policy: {
                validTo: '202412', // CredentialValidTo
                createdAt: '202612', // CredentialCreatedAt
                revealedAttributes: {
                    sex: '30',
                    dob: '40',
                }, // Map.Map AttributeTag AttributeValue
            },
            arData: {
                '1': {
                    encIdCredPubShare:
                        'a45be6a4dcb4690b6f9881dd847ce53ed80b7c1b2702eb63da7620413c3a22260361b8bdd24bcf49c96de7fd249c6618',
                },
            },
            proofs: 'f3f42fa6f8446b1eb76eada73f775a36504781dd8d2e748097ba5c57462631714d6ea7f2f3c00767405d39dd2ff29bc8f4fd236a6a8f079269aa6fed2261bba14ee73d63fbd23db1b3d6a7973799475f9ba23f8cea03abd9cc5c8772a85b67db5838a2107b852c5a3c82c03b6c62cb6f15315355e721d95abf00c7591b59f5c90df0b6757d7c249777f397c697a8fdae32d9caa68b87991887727675165c4bde191108bfafbdf3c6c57cc557ae7ce87a36139ddbe286c4d3c13d67d5f48467c0027134416c1ad644d5155004b7a915428fbe3444afd595a6ebd0dbcdb328fbf5000000000000000393d726050b9c1edec7e1358d88c643002605cd6943700e575ba8cfbbbee68ccb017a28982de6ebb90145f1da9484a6ada2148b8dc3a61b0bbf6b76c30c036955aadd768b52fabcd6535480e43bdca50e5e8d566209d721184b512cba564a1feba469eec81dc9c77585bfd523534f15d0dc2d59e916c43ab83817562245f69980af48ec3cebf3acf22eeb48dc9388fdb9a4dcca21460a4149893d64e66c6068e13a8085f71a9e82a76b6c404b100c05a09b4057721570bc4e7f0867b6f5d0e8e32258cea4c85c2a6585d1f1c93f3f329fdbceaa0519aaa2059379d509df6db2d33f9d656037f7ba673039397701f4556f37d3868e127dddefdb644174038a6ead538e0db52e8e6a0ec978137ed6cdb12503fb699e79c6e33399f811b2db4b04430000000889ef47336f24205f523a717704bf05ff98627f3b6eba33110228ed4df225d9dc0b5e8b92e7ab4065c04f6e91ff778709affbe1e76c37b2fa7c6fa783d59d8363c81a460f883d620bf1314e85f216184967df5b2e6c435af88a127cc6e725c7e2aa562d3e67ea1a41e5b3cccff14e333c8126101ecce61710b35a863bacf8e51866d26542196485597ada1e6efd3fd9c1a1307b7a48e4b66ad22b237941caa6d6e92cb2b5358e4a485e6ce7490028f729a273d59108b218a6c6d96e8955fc1162a657c8369e206c61a937474c5ee27c7082e674199644e653057c97648798b332c6e635299db67af4959abf3773937a7e9546a3195930109de6e42ef59791086cf967ea7c45c63dc947c4cfddd9fee7acb431ac83bd32327a1475f16577b122d68fe05b1535171ea3a59af80ba6ebb97b00d82604672fd50d8d8eec21e5ead546bccba375f4d316634d08fbf115b2c383b2ff854a6442df319649c906f7e6cc95df65fe8b4beee7ede6339bbce9a56640165d0cbec2b6988f6adf2bb85f5ff9a7a457a909ed18c176424c2304e7cb59a4cc1a7382dc2d0ee63f773011a6b73164384588b3122ef3dde0d42442d5cd8e78acf63e5b76dc7314a0b7082dbc17c991ea3496ba325feabdd7aa6c26694607d12e527fb9c7499593e8de26e8c61e287fb18197a2ee8f62badd79953ee2daff38685796a4a6041bcf44e0ff300a7b0ee399c48a426971e40aaa3ae3e47e701a4494ddc93a4f67381ec9c54e3225861595897b49106d52adafb80b5def406dabc15da54f6d1c0a32896298c0de885cb91895e7824fa4dd4565f39ff81dbdd7bd9874851ab2e7fe43b8d1485f33b8af96faa7d8eb936bd2407f3a75fb3ab1c4eaea943c264defa73e65512f52135c75927b1cf96b49f9b6943e1ba18e003ff499a787e583a5a369caa096077a132a1ffc47a43edceb1de7a93a8fa776c00047eec082cd7d8aa7b8299b04078c3720970ce0548f849770e81dcd22726dfdfa24e68a8ef0b708b1510c803c1aa60113f47cf9fe226e0527f7133e0258f41a5e05a3385c21a0fc320d9dddf13a7f6704891f776879e94ccc647c86583108c90c38cea2532b52095a92d53d1db7eaeed50377da67a1f6e505f599cb4bf01609eaf28dea6fbd2212cc23ae234bdb144a69068500b174bee0d5cdd79ae19d1c6c668931950f3233df100d05ec85fbce3bab2aa67b9db75fae714200cbccb41a48a558f85f981d8e8da22d652d75cc36602ab029b05dda656920b9fe66c1972df9555e509d2cabafaea84ab3627ec0e2f707f3e8258110c90fbf142e654fb2a3523fd844ed1f7a26d2899ce537c1f1f8fe9f352045fddc18fc77c6cef565ff50237bdbb915a4962fae0a5d7aac134648725818fadb5d5a15ca4684f7e1f031e1fb5576c74e24ebb98d7c7dc81b147dbd85035edc8f524b97be5a2415800d21354465f403f9a387202cec86a77fa69899e9db74e04244097ecd573e70dce9c69f9b4768ce06cf177051a0b50a3d53a5137fd0a5fa1240d42c1fe2aa66650288842fa541f5064e069ad3ecaa25bbe78ee7addf6683de0000000892924308f5ceb9bd80ab5d2598228a30b22a8bb7c7093cc772e0387cce037b32036e944feccc0479d1bd2a46bf137bf0aebb1e8cbd692c3d5ff69f697eea47cd6d077f7c6549e4a23112e0716c186a048e5d915a25cd38f44f14b1fbd8ae704f8cd30a70737095211061ef43617e5adeb28bd04d0368f9c6ec6be57cd81319b2f6c875b57b72c5af76d08fdf619ec5b0b7145e5588bf9d9ce9c5b3d1edc7ed0897f459a41efa147094a646305cef9faf8992010c438767182e1cec1af4f6a14aa4a53a264bb9c002a68b22713e83bcf0f9b7d442fcb12d5eecff7d4aa30a3dc052dc5bb5583c697a8fb0b60d6f48d9f7b7b144784fca51ad37674d05893c87a5675705231e36d90a138710733fdd02ec6d0590586eef36a5d3de887ca0250e1596ab5e244d6cedf0b2117756b64fbf1e00b7246cddd3d0bf9e6efda7cdea8141c4e265f8fb7144b63bc69fa9c144316996b33cbf02becb18e2e0bc16d836afada2b3456e20cfdca3b2a39cb345492906adc22d56ee12a676c09734624ac21affa8ff3de2a08fb52cb327553b05bd84be70e55678abbd4b178212e5d48122f1c9ad200aef8772e1aba5447cc684f033e3acb50b4bac275b3374e34ec2a044309343aeb76c16e9a54c978c91966e63917edfbdd62f5ac6932c1a1eb6baaafd1863a827b246ebf2e15f80abc77952c8c4227dc9e357762b6eaae33636055cc7ed8f93f8776cbeca24af2e79c9c22370be24b890eb3c10a612852ce07fe8af22c3fe0742bebd04b8a9e8be2e760af776a4e409e506997e070f0b31b8d0e541e5751ba7f28d9505417f0c93300312ed7d7d7d63b34b53abccd2c60b53b9bfb595ac824e40469aa120c050f9b5550a69816fe5ab54009a9e91b40560f72b1a54dbf9151227958ebeb22708bbfd2b1669ed1e51d3f1a11d2792120e08e0da1b8081cbca88871263dda2974da57fc0532e59c7c610b14928f92f8be3f8ac1239f18b155a0763e26841b5c71c520dc343a6102aed88658f89b94d4b3901c1cb4caa1aed2920cfc3dafffe3afce09380a9f4ef0229c06faf3607fd5dc5cac3266eaaedf73c1333ebf1a54d1f5d43b88def240b29432768af30be76aa66fbc75d80f4a475c66c982ee8dbbd441bac0ff6828ea14caa60c9e2b7e5df1de2c4b216f0fac11989a1c5272a1a595b3abda5ee2d25a889b33c4ae042db87deefce1f577e7b6724ee06489e21bb99c58629795060f5268f808877e07295a41f408fd0957fd9ae0a90fbf9843e187f945794173ff34094c10519e8b44be4e9486e4d542e4f1459dc73940026f190f35b9235e6a193f70555eba6a518dbf9fdba4ead30fa1c476769a848de6e07454af520cb960372341f094cae003a118320d30acaf3d3f1af26005e07a706ee2bd5e0d818e6edf3dddeff0eb5f6d669b9f9ba9c3e14a9f8b24657931a6c1f5a6280dce93becb2c45a465100692b14c0cf3e8335ed1dfd6cf589fa153ff9a410c4409658223f61c11258adc888cb17abd5791ca3170bec37f6860dbf576014492c7c1f043a8168f7b4eb1684f7c68df7ccbaf6538b10c11e1cabc259000000088c753367465b7d6194b2187733ad7acb4289df08b9c87dde7040590e6757baffdafa96d979f49e3ef39361aa8521f0428331afa7d48ed1e57dd9d54dbfb485de5205b5b8184c13ffe3417a421bb788773954e9a30e5fde7df21d57e40e0ee02f9054a48fc3ad91a364850b636c43feceeb75dd04c7e54f949e296483899ec76829a8c598ab189dd1f0f226ec85616226b026e0c8d713753f1b4b215b9b13c97a9edce7dfe799e0fa08972b2a8f7e14312dbc819fb90c2d0afaf2bc2041416e46a9d37ea083b9235862cc557795d87d8d98f80bfb5b3c8e604f217caf889a99f70f8632e10b7755fcfea6746957d9fddab1ff679969273e7daf630ac6efa2c77e4bda18e584350ea73301fe14c93b1248c84338ad1fd8aee38827afe2b73574e4b5ede1e614d63a6d16c4d1ca02f031e805db7c5ff1eb2f941c443b24aaeb543fe49ce42688708b4122e42049235766abaec09f5b1fd3f6307a1948332faac5cba563d5ed77ea086e096db30de5bc636289a559663876784a3f6aba50fdee1f38adddc4db529e09c4dddd37eaf604b56cbf1c5e0497b9e9b8791a9b0d6d54cf6261f503b303f1458065b6ec5069dd82a594fcd989d4daced82678a090a212b3da32bb0790db896a6947587cf3d9703d551867081fe45ec6d7e8bbd14505387da191aa65f1d57f9d4f7001fda0d70fbc53cd58f1d99ec547ee75046119177469a49382ad859a132f55ca9b7428bc96e57eb39fefcba8b41c7ac35dce3f93ccaa9b1ab34c1187d12e95815245378b84484285ee0b068820892a4e5c6005a4f58952b26427ff7df3a3c2164a40215f9e92793d11027bd1d41dc762ae727e9861ce5d89453e043ece343d9fbc63d22070bc6da93c717a48a2695b7fa068ad683676349ada92432d7cf0b33aefae0648a25e6834cbab544018eab17fada78486d2bccf8375ee1d38008d1b5369d4bec80a6514e58484bed26926451ca76f9029e8dcac503f34925d07839df037e6047fa0697ea229c9d332838c14b00d88693dce1e2f396431654d6df410b12ca2a34fd69ae080af2cb986ce3374fbe2a410c7908e6e727b04f493f0d7d16d44319af93b63cd1fd516e2499fa529b0ef5bc5437bc44c56b53f7c7b1a35ee3e7d4a1793e55fe17fa460c8aaa9e2a4064f9d4e6d352598',
            commitments: {
                cmmPrf: 'test',
                cmmCredCounter: 2,
                cmmIdCredSecSharingCoeff: [
                    '815c46e33c76b9be53f2302fea6569a7d1da156a8dfac831921b802b365b3cd4928b5a97c1302f50b1ee22d8fe6631ca',
                    '8e2e4cfc6a89ca8240ab592864fd7d7b4d8ae2ac54c60d09417ec25a89af2b6bb1c3cc9568b17e3c23125d8962555fad',
                ],
                cmmAttributes: {
                    '1': {
                        firstName: 'Mani Singh',
                    },
                },
                cmmMaxAccounts: '200',
            },
        };

        const updateCredentials = {
            newCredentials: [
                {
                    index: 1,
                    cdi: credentialValues,
                },
                {
                    index: 2,
                    cdi: credentialValues,
                },
            ],
            removeCredentialIds: [],
            threshold: 2,
        };

        const txCre = {
            sender: transaction.header.sender,
            nonce: transaction.header.nonce.toString(),
            expiry: BigInt(getDefaultExpiry().toString()),
            energyAmount: '10000',
            transactionKind: AccountTransactionType.UpdateCredentials,
            payload: updateCredentials,
        };

        const { signature } = await ccd.signUpdateCredentials(txCre, '44/919/0/0/0/0');

        console.log(signature);

        // This creates credentials on device
        const data = {
            identity: 0,
            identityProvider: 0,
        };

        const { privateKey, credentialId } = await ccd.exportPrivateKeyNew(data, 1, 2);

        console.log(privateKey);
        console.log(credentialId);
        const accountAddress = getAccountAddress(credentialId).address;
        console.log('Ledger Account Address:', accountAddress); */

        /* const getDerivationPath = (account: number) => `44'/919'/0'/${account}'/0'/0'`;

        const addresses: { index: number; address: string }[] = [];

        for (let i = 0; i < 25; i++) {
            const path = getDerivationPath(i);
            const { publicKey } = await ccd.getPublicKey(path, false, false); // false = don't display on device
            const address = getAccountAddress(publicKey).address;
            console.log(address);
        }

        transaction.header.sender = AccountAddress.fromBase58('3yR4ur3gUnHpvGpw7znhVJonNoLW2ofQpRLfHLbX9wvfAi4ZYj');
        /*const { publicKey } = await ccd.getPublicKey('44/919/0/0/0/0', true, false);
        console.log(publicKey);

        // Convert public key buffer to hex
        const hexPubKey = encodeHexString(publicKey);

        // Derive address from public key (using web-sdk)
        const accountAddress = getAccountAddress(publicKey);

        console.log('Ledger-derived account address:', accountAddress.address);
        */

        // const { status } = await ccd.verifyAddress(false, 0, 0, 0);
        // const { address } = await ccd.verifyAddress(pathString, true); // Show on device
        // console.log(status);

        const toAddress = (transaction.payload as SimpleTransferPayload).toAddress?.address;
        const amount = (transaction.payload as SimpleTransferPayload).amount?.microCcdAmount ?? BigInt(0);
        const payload = buildSimpleTransferPayload(toAddress, BigInt(amount));

        const tx = {
            sender: transaction.header.sender,
            nonce: transaction.header.nonce.toString(),
            expiry: BigInt(getDefaultExpiry().toString()),
            energyAmount: '10000',
            transactionKind: transaction.type,
            payload,
        };

        /* if (address !== transaction.header.sender) {
            console.log('Mismatch between Ledger address and sender address');
        } */

        const { signature } = await ccd.signTransfer(tx, pathString);

        const accountTransactionSignature = convertToAccountTransactionSignature(signature);
        console.log(accountTransactionSignature);
    } catch (error) {
        if (error && error.name === 'LockedDeviceError') {
            throw new Error('Please unlock your Ledger device and open the concordium app.');
        } /* else {
            throw new Error(error.message);
        } */
    }
    const signature1 = await signTransaction(transaction, buildBasicAccountSigner(signingKey));
    console.log(signature1);

    const result = await client.sendAccountTransaction(transaction, signature1);

    if (!result) {
        throw new Error('transaction was rejected by the node');
    }

    return getAccountTransactionHash(transaction, signature1);
}

/**
 * Validates if the chosen transfer amount can be sent with the current balance at disposal.
 * @param decimals how many decimals can the transfer amount. This is used to convert it from a fractional string to an integer.
 * @param estimatedFee additional costs for the transfer.
 */
export function validateTransferAmount(
    transferAmount: string,
    atDisposal: bigint | undefined,
    decimals = 0,
    estimatedFee = 0n
): string | undefined {
    if (!isValidResolutionString(10n ** BigInt(decimals), false, false, false)(transferAmount)) {
        return i18n.t('utils.ccdAmount.invalid');
    }
    const amountToValidateInteger = fractionalToInteger(transferAmount, decimals);
    if (atDisposal !== undefined && atDisposal < amountToValidateInteger + estimatedFee) {
        return i18n.t('utils.ccdAmount.insufficient');
    }
    if (amountToValidateInteger === 0n) {
        return i18n.t('utils.ccdAmount.zero');
    }
    return undefined;
}

export function validateBakerStake(
    amountToValidate: string,
    chainParameters?: Exclude<ChainParameters, ChainParametersV0>,
    accountInfo?: AccountInfo,
    estimatedFee = 0n
): string | undefined {
    if (!isValidCcdString(amountToValidate)) {
        return i18n.t('utils.ccdAmount.invalid');
    }
    const bakerStakeThreshold = chainParameters?.minimumEquityCapital.microCcdAmount || 0n;
    const amount = ccdToMicroCcd(amountToValidate);

    const amountChanged =
        accountInfo?.type !== AccountInfoType.Baker || amount !== accountInfo.accountBaker.stakedAmount.microCcdAmount;

    if (amountChanged && bakerStakeThreshold > amount) {
        return i18n.t('utils.ccdAmount.belowBakerThreshold', { threshold: displayAsCcd(bakerStakeThreshold) });
    }

    if (
        accountInfo &&
        (BigInt(accountInfo.accountAmount.microCcdAmount) < amount + estimatedFee ||
            // the fee must be paid with the current funds at disposal, because a reduction in delegation amount is not immediate.
            getPublicAccountAmounts(accountInfo).atDisposal < estimatedFee)
    ) {
        return i18n.t('utils.ccdAmount.insufficient');
    }

    return undefined;
}

export function validateAccountAddress(cand: string): string | undefined {
    try {
        // eslint-disable-next-line no-new
        AccountAddress.fromBase58(cand);
        return undefined;
    } catch {
        return i18n.t('utils.address.invalid');
    }
}

export function validateDelegationAmount(
    delegatedAmount: string,
    accountInfo: AccountInfo,
    estimatedFee: bigint,
    targetStatus?: BakerPoolStatusDetails
): string | undefined {
    if (!isValidCcdString(delegatedAmount)) {
        return i18n.t('utils.ccdAmount.invalid');
    }

    const amount = ccdToMicroCcd(delegatedAmount);

    if (amount === 0n) {
        return i18n.t('utils.ccdAmount.zero');
    }

    const max =
        targetStatus && targetStatus.delegatedCapitalCap && targetStatus.delegatedCapital
            ? targetStatus.delegatedCapitalCap.microCcdAmount - targetStatus.delegatedCapital.microCcdAmount
            : undefined;
    if (max !== undefined && amount > max) {
        return i18n.t('utils.ccdAmount.exceedingDelegationCap', { max: displayAsCcd(max) });
    }

    if (
        BigInt(accountInfo.accountAmount.microCcdAmount) < amount + estimatedFee ||
        // the fee must be paid with the current funds at disposal, because a reduction in delegation amount is not immediate.
        getPublicAccountAmounts(accountInfo).atDisposal < estimatedFee
    ) {
        return i18n.t('utils.ccdAmount.insufficient');
    }

    return undefined;
}

export function getDefaultExpiry(): TransactionExpiry.Type {
    return TransactionExpiry.fromDate(new Date(Date.now() + DEFAULT_TRANSACTION_EXPIRY));
}

export function getTransactionTypeName(type: AccountTransactionType): string {
    switch (type) {
        case AccountTransactionType.Transfer: {
            return i18n.t('utils.transaction.type.simple');
        }
        case AccountTransactionType.InitContract: {
            return i18n.t('utils.transaction.type.init');
        }
        case AccountTransactionType.Update: {
            return i18n.t('utils.transaction.type.update');
        }
        case AccountTransactionType.RegisterData: {
            return i18n.t('utils.transaction.type.registerData');
        }
        case AccountTransactionType.ConfigureDelegation: {
            return i18n.t('utils.transaction.type.configureDelegation');
        }
        case AccountTransactionType.ConfigureBaker: {
            return i18n.t('utils.transaction.type.configureBaker');
        }
        default: {
            return AccountTransactionType[type];
        }
    }
}

export const createPendingTransaction = (
    type: AccountTransactionType,
    transactionHash: string,
    amount: bigint,
    cost?: bigint,
    fromAddress?: string,
    toAddress?: string
): BrowserWalletAccountTransaction => ({
    amount,
    blockHash: '',
    events: [],
    type,
    status: TransactionStatus.Pending,
    time: BigInt(Math.round(Date.now() / 1000)),
    id: 0,
    cost,
    transactionHash,
    fromAddress,
    toAddress,
});

export const createPendingTransactionFromAccountTransaction = (
    transaction: AccountTransaction,
    transactionHash: string,
    cost?: bigint
) => {
    const amount = (transaction.payload as SimpleTransferPayload).amount?.microCcdAmount ?? BigInt(0);
    const toAddress = (transaction.payload as SimpleTransferPayload).toAddress?.address;

    return createPendingTransaction(
        transaction.type,
        transactionHash,
        amount,
        cost,
        transaction.header.sender.address,
        toAddress
    );
};

export function useHasPendingTransaction(transactionType: AccountTransactionType): boolean {
    return useAtomValue(selectedPendingTransactionsAtom).some((t) => t.type === transactionType);
}

/**
 * Extract the microCCD amount related for the transaction, excluding the cost.
 * Note that for many transactions there is no related amount, in which case this returns 0.
 */
export function getTransactionAmount(type: AccountTransactionType, payload: AccountTransactionPayload): bigint {
    switch (type) {
        case AccountTransactionType.InitContract:
            return (payload as InitContractPayload).amount.microCcdAmount;
        case AccountTransactionType.Update:
            return (payload as UpdateContractPayload).amount.microCcdAmount;
        case AccountTransactionType.Transfer:
            return (payload as SimpleTransferPayload).amount.microCcdAmount;
        case AccountTransactionType.TransferWithMemo:
            return (payload as SimpleTransferWithMemoPayload).amount.microCcdAmount;
        default:
            return 0n;
    }
}
/** Hook which exposes a function for getting the transaction fee for a given transaction type */
export function useGetTransactionFee() {
    const cp = useBlockChainParameters();

    return useCallback(
        (type: AccountTransactionType, payload: AccountTransactionPayload) => {
            if (cp === undefined) {
                return undefined;
            }
            const energy = getEnergyCost(type, payload);
            return convertEnergyToMicroCcd(energy, cp);
        },
        [cp]
    );
}

/** Types of errors returned when attempting transaction submission */
export enum TransactionSubmitErrorType {
    InsufficientFunds = 'InsufficientFunds',
}

/** Error returned when attempting to submit a transaction using {@linkcode useTransactionSubmit} */
export class TransactionSubmitError extends Error {
    private constructor(public type: TransactionSubmitErrorType) {
        super();
        super.name = `TransactionSubmitError.${type}`;
    }

    public static insufficientFunds(): TransactionSubmitError {
        return new TransactionSubmitError(TransactionSubmitErrorType.InsufficientFunds);
    }
}

/**
 * Hook returning a function to submit a transaction of the specified type from the specified sender.
 * If successful, a pending transaction is added to the local store which will then await finalization status from the node.
 *
 * @param sender - The account address of the sender.
 * @param type - The type of the account transaction.
 *
 * @returns A function to submit a transaction.
 * @throws {@linkcode TransactionSubmitError}
 */
export function useTransactionSubmit(sender: AccountAddress.Type, type: AccountTransactionType) {
    const grpc = useAtomValue(grpcClientAtom);
    const key = usePrivateKey(sender.address);
    const addPendingTransaction = useUpdateAtom(addPendingTransactionAtom);

    return useCallback(
        async (payload: AccountTransactionPayload, cost: CcdAmount.Type) => {
            const { accountAmount, accountAvailableBalance } = await grpc.getAccountInfo(sender);

            if (accountAvailableBalance.microCcdAmount < cost.microCcdAmount) {
                throw TransactionSubmitError.insufficientFunds();
            }

            const available = [
                AccountTransactionType.ConfigureBaker,
                AccountTransactionType.ConfigureDelegation,
            ].includes(type)
                ? accountAmount
                : accountAvailableBalance;
            if (available.microCcdAmount < getTransactionAmount(type, payload) + (cost.microCcdAmount || 0n)) {
                throw TransactionSubmitError.insufficientFunds();
            }

            const nonce = await grpc.getNextAccountNonce(sender);

            const header = {
                expiry: getDefaultExpiry(),
                sender,
                nonce: nonce.nonce,
            };
            const transaction = { payload, header, type };

            const hash = await sendTransaction(grpc, transaction, key!);
            const pending = createPendingTransactionFromAccountTransaction(transaction, hash, cost.microCcdAmount);
            await addPendingTransaction(pending);

            return hash;
        },
        [key]
    );
}
