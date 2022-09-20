/* eslint-disable no-console */
import React, { useEffect, useState, useContext } from 'react';
import { detectConcordiumProvider } from '@concordium/browser-wallet-api-helpers';
import { createCollection, state, mint } from './utils';
import { RAW_SCHEMA } from './constant';
import { serializeUpdateContractParameters, toBuffer } from '@concordium/web-sdk';

const MINT_HOST = "http://10.45.255.52:8888";

export default function PiggyBankV0() {
    const { account, isConnected } = useContext(state);
    const [collections, setCollections] = useState<bigint[]>([1087n]);
    const [nfts, setNFTS] = useState<Record<string,string[]>>({});

    useEffect(async () => {
        const response = await fetch(MINT_HOST + "/collections", {
            headers: new Headers({"Access-Control-Allow-Origin": "*" }),
            mode: 'cors'
        });
        const r = await response.json();
        setNFTS(r);
        setCollections(Object.keys(r).map((x) => BigInt(x)));
    }, [])

    if (!account) {
        return null;
    }

    return (
        <>
            <button
                className="init-collection"
                type="button"
                disabled={!isConnected}
                onClick={() => createCollection(account).then((newIndex) => setCollections((colls) => [...colls, newIndex]))}
        >
        Init Collection
            </button>
            {collections.map((index) => (<Collection index={index} account={account} nfts={nfts[index.toString()]} addNft={(nft) => {
                const nftsCollection = {...nfts};
                const myNFTS = nfts[index.toString()] || [];
                nftsCollection[index] = [...myNFTS, nft];
                setNFTS(nftsCollection);
            }} />))}
        </>
    );
}

type CollectionProps = {
    index: bigint,
    account: string,
    nfts: string[] | undefined,
    addNft: (nft: string) => void
}

function Collection( { index, account, nfts, addNft }: CollectionProps) {
    return (<div className="collection">
        <h3>{index.toString()}</h3>
        <form className="form" onSubmit={async (event: any) => {
        event.preventDefault();
        const id = Math.round((Math.random() * 100000)).toString().padEnd(8, "0");
            const response = await fetch(MINT_HOST + "/metadata/" + id, {
            method: 'POST',
            body: new FormData(event.target),
            headers: new Headers({"Access-Control-Allow-Origin": "*" }),
            mode: 'cors'
        });
        console.log(response);
        const { url } = await response.json();
        // Get values from form + send to backend.
        if (url) {
            mint(account, id, url, index).then(() => {
                console.log(id);
                addNft(id);
            });
        }
    }}>
        <input name="address" type="string" value={index.toString()} className="hidden" />
        <input name="display" type="file"/>
        <label for="name">Name</label>
        <input name="name" type="string"/>
        <label for="description">Description</label>
        <input name="description" type="string"/>
        <button type="submit">mint</button>
    </form>
    <div className="collection-nfts" >
            {(nfts || []).map((nft) => <NFT id={nft} index={index}  />)}
    </div>
    </div>
    );
}


type NFTPRops = {
    index: bigint,
    id: string,
};

export const getTokenUrl = (id: string, index: bigint, subindex = 0n): Promise<string> => {
    return new Promise((resolve) => {
        const param = serializeUpdateContractParameters('CIS2-NFT','tokenMetadata', [ id ], toBuffer(RAW_SCHEMA, 'base64'));
        detectConcordiumProvider()
            .then((provider) => {
                provider.getJsonRpcClient().invokeContract({ contract: { index, subindex}, method: 'CIS2-NFT.tokenMetadata',  parameter: param }).then((returnValue) => {
                    console.log('text');
                    if (returnValue && returnValue.tag === 'success' && returnValue.returnValue) {
                        const bufferStream = toBuffer(returnValue.returnValue,'hex');
                        const length = bufferStream.readUInt16LE(2);
                        const url = bufferStream.slice(4, 4 + length).toString('utf8');
                        resolve(url);
                    } else {
                        console.log(id);
                    }
                })
            })
    })
}

function NFT({index, id}: NFTPRops) {
    const [metadata, setMetadata] = useState<any>();

    useEffect(() => {
        getTokenUrl(id,index).then((tokenUrl) => {
            fetch(tokenUrl, {headers: new Headers({"Access-Control-Allow-Origin": "*" }), mode: 'cors'}).then((resp) => {
                if (resp.ok) {
                    resp.json().then(setMetadata);
                }
            })
        });
    }, [index, id]);

    if (!metadata) {
        return null;
    }

    return (<div className="nft" title={metadata.description} ><p>{metadata.name}</p>
        <img src={metadata.display.url}/>
        </div>);
}
