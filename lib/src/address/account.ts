import ow from 'ow';
import bech32 from 'bech32';

import { Secp256k1KeyPair } from '../keypair/secp256k1';
import { owAccountPubKeySource, owAccountOptions } from './ow.types';
import { hash160 } from '../utils/hash';
import { Bytes } from '../utils/bytes/bytes';
import { InitConfigurations } from '../core/cro';

export const userAccount = function (config: InitConfigurations) {
    return class Account {
        public readonly pubKeyDigest: Bytes;

        /**
         * Returns bech32 account address from public key
         * @param {Secp256k1KeyPair | Bytes} pubKeySource A Secp256k1KeyPair or a compressed public key
         * represented in Bytes
         * @param options Account options
         * @param options.prefix Bech32 prefix of the account address
         * @throws {Error} when the public key is invalid
         */
        constructor(pubKeySource: AccountPubKeySource, options: AccountOptions) {
            ow(pubKeySource, 'pubKeySource', owAccountPubKeySource);
            ow(options, 'options', owAccountOptions);

            if (pubKeySource instanceof Bytes) {
                if (pubKeySource.length !== 33) {
                    throw new TypeError(
                        `Expected public key to be in compressed form of byte length in 33 bytes, got ${pubKeySource.length}`,
                    );
                }
            }

            const pubKey =
                pubKeySource instanceof Secp256k1KeyPair ? pubKeySource.getPubKey({ compressed: true }) : pubKeySource;
            this.pubKeyDigest = hash160(pubKey);
        }

        public getAddress(): string {
            const words = bech32.toWords(this.pubKeyDigest.toUint8Array());
            return bech32.encode(config.network.addressPrefix, words);
        }
    };
};

export type AccountPubKeySource = Secp256k1KeyPair | Bytes;

export type AccountOptions = {
    prefix: string;
    // TODO: support network
};
