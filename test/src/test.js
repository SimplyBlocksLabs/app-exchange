// @flow
import "@babel/polyfill";
import HttpTransport from "@ledgerhq/hw-transport-http/lib/HttpTransport";
import TransportNodeHid from "@ledgerhq/hw-transport-node-hid/lib/TransportNodeHid";
import Swap from "./Swap.js";
import type Transport from "@ledgerhq/hw-transport";
import secp256k1 from "secp256k1";
import sha256 from "js-sha256";
import "./protocol_pb.js";
import { bip32asBuffer } from "./bip32";
import Eth from "@ledgerhq/hw-app-eth";
import { byContractAddress } from "@ledgerhq/hw-app-eth/erc20";

async function getTransport() {
  let transport;
  if(process.env.HID){
    transport = await TransportNodeHid.open();
  }
  else{
    transport = await HttpTransport.open("http://127.0.0.1:9998");
  }
  return transport;
}

/**
 * address format is one of legacy | p2sh | bech32
 */
export type AddressFormat = "legacy" | "p2sh" | "bech32";

const addressFormatMap = {
  legacy: 0,
  p2sh: 1,
  bech32: 2
};

export function getSerializedAddressParametersBTC(
  path: string, format?: AddressFormat
): {addressParameters: Buffer} {
  format = format || "legacy";
  if (!(format in addressFormatMap)) {
    throw new Error("btc.getWalletPublicKey invalid format=" + format);
  }
  const buffer = bip32asBuffer(path);
  const addressParameters = Buffer.concat([Buffer.from([addressFormatMap[format]]), buffer]);
  return {addressParameters};
}

export function  getSerializedAddressParametersETH(
  path: string
): {addressParameters: Buffer} {
  const addressParameters = bip32asBuffer(path);
  return {addressParameters};
}

// This values where generated by ./tools/index.js scripts
const swapTestPrivateKey: Buffer = Buffer.from(
[0x1D, 0x20, 0x2B, 0xC5, 0xEE, 0x1C, 0xED, 0x2F, 0xE7, 0xAF,
 0x32, 0x38, 0x20, 0x16, 0xA1, 0x7, 0x35, 0x5D, 0xC0, 0xD2,
 0x4E, 0x22, 0x73, 0x41, 0xF4, 0x31, 0xA, 0x3C, 0xC, 0x50,
 0xD9, 0x3D]);

const partnerSerializedNameAndPubKey: Buffer = Buffer.from(
[0x9, 0x53, 0x57, 0x41, 0x50, 0x5F, 0x54, 0x45, 0x53, 0x54, 0x4, 0x66, 0xA, 0x15, 0x3, 0x9, 0xFB, 0x52, 0xF3, 0xD4, 0x2C, 0x27, 0xAD, 0x4, 0xDC, 0x31, 0x99, 0xAA, 0x23, 0x37, 0xBD, 0x2A, 0x8A, 0x0, 0x2C, 0x53, 0x37, 0xD1, 0x78, 0x8A, 0xE3, 0x47, 0xD3, 0x33, 0x6E, 0x0, 0xEA, 0x33, 0xF4, 0x77, 0x8C, 0xD9, 0x1F, 0xF7, 0xD2, 0x8A, 0x89, 0x42, 0xEF, 0xD7, 0x73, 0x5D, 0xC3, 0xAD, 0x1B, 0x74, 0x53, 0xF1, 0xB9, 0xBD, 0x1F, 0xB4, 0xFE, 0x65, 0xFD]);

const DERSignatureOfPartnerNameAndPublicKey: Buffer = Buffer.from(
[0x30, 0x44, 0x2, 0x20, 0x69, 0xAB, 0x98, 0xDF, 0xB8, 0x27, 0x7F, 0x36, 0x22, 0x9, 0x6D, 0x12, 0x48, 0x5C, 0x92, 0xD3, 0x14, 0xB5, 0x54, 0xAB, 0x91, 0x5F, 0x4C, 0xB1, 0x10, 0xB6, 0x6B, 0x60, 0x10, 0xD0, 0xA, 0xF2, 0x2, 0x20, 0x2B, 0x6C, 0xC7, 0xF9, 0x79, 0x69, 0xEE, 0x3C, 0x9C, 0xE7, 0x88, 0xF8, 0x82, 0x79, 0xE4, 0x82, 0x1B, 0xAC, 0x7D, 0x5A, 0xA4, 0xE7, 0x10, 0x48, 0xE1, 0x16, 0x2, 0x0, 0x33, 0xEF, 0xA6, 0x9B]);

// 3 BTC 7 Bitcoin 0
const BTCConfig: Buffer = Buffer.from(
[0x3, 0x42, 0x54, 0x43, 0x7, 0x42, 0x69, 0x74, 0x63, 0x6F, 0x69, 0x6E, 0x0]);

const BTCConfigSignature: Buffer = Buffer.from(
[0x30, 0x45, 0x2, 0x21, 0x0, 0x97, 0xCE, 0x38, 0xC5, 0x15, 0x60, 0xFD, 0xBF, 0x2D, 0xBE, 0x87, 0x3C, 0x22, 0xFC, 0xBE, 0xC0, 0x7B, 0x58, 0xF1, 0x33, 0x13, 0x24, 0x5E, 0x8F, 0xB6, 0x4F, 0xDB, 0x2B, 0x32, 0xD4, 0x55, 0xE0, 0x2, 0x20, 0xA, 0xE6, 0x3C, 0xDA, 0x3C, 0xD3, 0xCC, 0x3, 0x43, 0x65, 0x3B, 0x38, 0xE5, 0xC2, 0xC5, 0xC2, 0x7B, 0xFE, 0x47, 0xB3, 0x5D, 0x25, 0x30, 0x26, 0x37, 0x89, 0x63, 0x47, 0x59, 0xC6, 0xD5, 0xB4]);

// 3 LTC 8 Litecoin 0
const LTCConfig: Buffer = Buffer.from(
[0x3, 0x4C, 0x54, 0x43, 0x8, 0x4C, 0x69, 0x74, 0x65, 0x63, 0x6F, 0x69, 0x6E, 0x0]);

const LTCConfigSignature: Buffer = Buffer.from(
[0x30, 0x44, 0x2, 0x20, 0x2A, 0xD5, 0x61, 0xDD, 0x8B, 0x3B, 0x98, 0x9C, 0xEA, 0x41, 0x1D, 0x4C, 0x1D, 0x8A, 0x6A, 0x62, 0x71, 0xB4, 0xF7, 0x2F, 0xB1, 0x66, 0x25, 0x9C, 0x89, 0x8F, 0xFC, 0x11, 0x70, 0x74, 0x72, 0xEB, 0x2, 0x20, 0x34, 0x6A, 0xA8, 0x95, 0x5E, 0x8E, 0x6B, 0xE6, 0x5D, 0x2F, 0xC6, 0x58, 0x36, 0x3A, 0xF4, 0x31, 0xD7, 0x1E, 0xA8, 0x65, 0xCC, 0xC8, 0x3D, 0xD4, 0xA7, 0x14, 0x9B, 0xEF, 0xF9, 0x35, 0x21, 0xB8]);

// 3 ETH 8 Ethereum 0
const ETHConfig: Buffer = Buffer.from(
[0x3, 0x45, 0x54, 0x48, 0x8, 0x45, 0x74, 0x68, 0x65, 0x72, 0x65, 0x75, 0x6D, 0x5, 0x3, 0x45, 0x54, 0x48, 0x12]);

const ETHConfigSignature: Buffer = Buffer.from(
[0x30, 0x44, 0x2, 0x20, 0x5F, 0xEF, 0x55, 0x54, 0x36, 0xAC, 0xE6, 0x76, 0x8B, 0xA6, 0x66, 0x6A, 0xB7, 0x83, 0x4B, 0x16, 0x87, 0x36, 0x9B, 0x6, 0x27, 0x47, 0x78, 0xFD, 0xD2, 0x8E, 0xB, 0x88, 0xD3, 0x43, 0x4D, 0xE9, 0x2, 0x20, 0x6A, 0x67, 0xF4, 0xCF, 0x62, 0x2C, 0x6B, 0xBC, 0x12, 0x7B, 0xBE, 0x86, 0x6A, 0x7B, 0x65, 0x40, 0xBD, 0x97, 0xE9, 0x1A, 0xCB, 0x38, 0xF1, 0x79, 0xA5, 0x54, 0xE6, 0x94, 0xBD, 0xEA, 0x50, 0x43]);

// 3 ETH 8 Ethereum 4 Config(2 AE 0x12(decimals))
const AEConfig: Buffer = Buffer.from(
[0x2, 0x41, 0x45, 0x8, 0x45, 0x74, 0x68, 0x65, 0x72, 0x65, 0x75, 0x6D, 0x4, 0x2, 0x41, 0x45, 0x12]);

const AEConfigSignature: Buffer = Buffer.from(
[0x30, 0x44, 0x2, 0x20, 0x6B, 0xB9, 0x7B, 0xE5, 0x7A, 0x2D, 0x24, 0x52, 0xD5, 0xA8, 0xEC, 0x2E, 0x6C, 0xAE, 0x3B, 0x55, 0x1F, 0x7A, 0x7E, 0x6D, 0xAE, 0x96, 0x22, 0x2B, 0xCB, 0x33, 0x27, 0x9E, 0x3F, 0x5A, 0x28, 0x17, 0x2, 0x20, 0x2F, 0x41, 0x3C, 0xE6, 0xD1, 0xE5, 0x83, 0x2C, 0xD, 0x3B, 0x24, 0xE9, 0xA2, 0x19, 0x94, 0x9E, 0x4B, 0xFE, 0x6C, 0x5, 0xE1, 0x18, 0x8A, 0x64, 0x1A, 0xE6, 0xED, 0x53, 0x48, 0x45, 0x55, 0xC0]);


function numberToBigEndianBuffer(x: number): Buffer {
  var hex =x.toString(16);
  return Buffer.from(hex.padStart(hex.length + hex.length % 2, '0'), 'hex');
}

/*
test('TransactionId should be 10 uppercase letters', async () => {
  const transport: Transport<string> = await HttpTransport.open("http://127.0.0.1:9998");
  const swap: Swap = new Swap(transport);
  const transactionId: string  = await swap.startNewTransaction();
  expect(transactionId.length).toBe(10);
  expect(transactionId).toBe(transactionId.toUpperCase());
})

test('SetPartnerKey should not throw', async () => {
  const transport: Transport<string> = await HttpTransport.open("http://127.0.0.1:9998");
  const swap: Swap = new Swap(transport);
  const transactionId: string  = await swap.startNewTransaction();
  await expect(swap.setPartnerKey(partnerSerializedNameAndPubKey)).resolves.toBe(undefined);
})

test('Wrong partner data signature should not be accepted', async () => {
  const transport: Transport<string> = await HttpTransport.open("http://127.0.0.1:9998");
  const swap: Swap = new Swap(transport);
  const transactionId: string  = await swap.startNewTransaction();
  swap.setPartnerKey(partnerSerializedNameAndPubKey);
  await expect(swap.checkPartner(Buffer.alloc(70)))
    .rejects.toEqual(new Error("Swap application report error SIGN_VERIFICATION_FAIL"));
})

test('Correct signature of partner data should be accepted', async () => {
  const transport: Transport<string> = await HttpTransport.open("http://127.0.0.1:9998");
  const swap: Swap = new Swap(transport);
  const transactionId: string  = await swap.startNewTransaction();
  swap.setPartnerKey(partnerSerializedNameAndPubKey);
  await expect(swap.checkPartner(DERSignatureOfPartnerNameAndPublicKey)).resolves.toBe(undefined);
})


test('Process transaction should not fail', async () => {
  const transport: Transport<string> = await HttpTransport.open("http://127.0.0.1:9998");
  const swap: Swap = new Swap(transport);
  const transactionId: string  = await swap.startNewTransaction();
  swap.setPartnerKey(partnerSerializedNameAndPubKey);
  swap.checkPartner(DERSignatureOfPartnerNameAndPublicKey);
  var tr  = new proto.ledger_swap.NewTransactionResponse();
  tr.setPayinAddress("2324234324324234");
  tr.setPayinExtraId("");
  tr.setRefundAddress("sfdsfdsfsdfdsfsdf");
  tr.setRefundExtraId("");
  tr.setPayoutAddress("asdasdassasadsada");
  tr.setPayoutExtraId("");
  tr.setCurrencyFrom("BTC");
  tr.setCurrencyTo("ETH");
  // 100000000 Satoshi to 48430000000000000000 Wei (1 BTC to 48.43 ETH)
  tr.setAmountToProvider(numberToBigEndianBuffer(100000000));
  tr.setAmountToWallet(numberToBigEndianBuffer(48430000000000000000));
  tr.setDeviceTransactionId(transactionId);

  const payload: Buffer = Buffer.from(tr.serializeBinary());
  await expect(swap.processTransaction(payload)).resolves.toBe(undefined);
})

test('Transaction signature should be checked without errors', async () => {
  const transport: Transport<string> = await HttpTransport.open("http://127.0.0.1:9998");
  const swap: Swap = new Swap(transport);
  const transactionId: string  = await swap.startNewTransaction();
  swap.setPartnerKey(partnerSerializedNameAndPubKey);
  swap.checkPartner(DERSignatureOfPartnerNameAndPublicKey);
  var tr  = new proto.ledger_swap.NewTransactionResponse();
  tr.setPayinAddress("2324234324324234");
  tr.setPayinExtraId("");
  tr.setRefundAddress("sfdsfdsfsdfdsfsdf");
  tr.setRefundExtraId("");
  tr.setPayoutAddress("asdasdassasadsada");
  tr.setPayoutExtraId("");
  tr.setCurrencyFrom("BTC");
  tr.setCurrencyTo("ETH");
  // 100000000 Satoshi to 48430000000000000000 Wei (1 BTC to 48.43 ETH)
  tr.setAmountToProvider(numberToBigEndianBuffer(100000000));
  tr.setAmountToWallet(numberToBigEndianBuffer(48430000000000000000));
  tr.setDeviceTransactionId(transactionId);

  const payload: Buffer = Buffer.from(tr.serializeBinary());
  swap.processTransaction(payload);
  const digest: Buffer = Buffer.from(sha256.sha256.array(payload));
  const signature: Buffer = secp256k1.sign(digest, swapTestPrivateKey).signature;
  await expect(swap.checkTransactionSignature(secp256k1.signatureExport(signature))).resolves.toBe(undefined);
})


test('Wrong transactions signature should be rejected', async () => {
  const transport: Transport<string> = await HttpTransport.open("http://127.0.0.1:9998");
  const swap: Swap = new Swap(transport);
  const transactionId: string  = await swap.startNewTransaction();
  swap.setPartnerKey(partnerSerializedNameAndPubKey);
  swap.checkPartner(DERSignatureOfPartnerNameAndPublicKey);
  var tr  = new proto.ledger_swap.NewTransactionResponse();
  tr.setPayinAddress("2324234324324234");
  tr.setPayinExtraId("");
  tr.setRefundAddress("sfdsfdsfsdfdsfsdf");
  tr.setRefundExtraId("");
  tr.setPayoutAddress("asdasdassasadsada");
  tr.setPayoutExtraId("");
  tr.setCurrencyFrom("BTC");
  tr.setCurrencyTo("ETH");
  // 100000000 Satoshi to 48430000000000000000 Wei (1 BTC to 48.43 ETH)
  tr.setAmountToProvider(numberToBigEndianBuffer(100000000));
  tr.setAmountToWallet(numberToBigEndianBuffer(48430000000000000000));
  tr.setDeviceTransactionId(transactionId);

  const payload: Buffer = Buffer.from(tr.serializeBinary());
  swap.processTransaction(payload);
  const digest: Buffer = Buffer.from(sha256.sha256.array(payload));
  const signature: Buffer = secp256k1.sign(digest, swapTestPrivateKey).signature;
  const wrongSign: Buffer = secp256k1.signatureExport(signature);
  console.log(wrongSign.length);
  wrongSign.reverse();
  wrongSign[1] = wrongSign.length - 2;
  await expect(swap.checkTransactionSignature(wrongSign))
    .rejects.toEqual(new Error("Swap application report error SIGN_VERIFICATION_FAIL"));
})


test('Wrong payout address should be rejected', async () => {
  jest.setTimeout(100000);
  const transport: Transport<string> = await HttpTransport.open("http://127.0.0.1:9998");
  const swap: Swap = new Swap(transport);
  const btc: Btc = new Btc(transport);
  const transactionId: string  = await swap.startNewTransaction();
  await swap.setPartnerKey(partnerSerializedNameAndPubKey);
  await swap.checkPartner(DERSignatureOfPartnerNameAndPublicKey);
  var tr  = new proto.ledger_swap.NewTransactionResponse();
  tr.setPayinAddress("2324234324324234");
  tr.setPayinExtraId("");
  tr.setRefundAddress("sfdsfdsfsdfdsfsdf");
  tr.setRefundExtraId("");
  tr.setPayoutAddress("LKtSt6xfsmJMkPT8YyViAsDeRh7k8UfNjL");
  tr.setPayoutExtraId("");
  tr.setCurrencyFrom("BTC");
  tr.setCurrencyTo("LTC");
  // 1 BTC to 1 LTC
  tr.setAmountToProvider(numberToBigEndianBuffer(100000000));
  tr.setAmountToWallet(numberToBigEndianBuffer(48430000000000000000));
  tr.setDeviceTransactionId(transactionId);

  const payload: Buffer = Buffer.from(tr.serializeBinary());
  await swap.processTransaction(payload);
  const digest: Buffer = Buffer.from(sha256.sha256.array(payload));
  const signature: Buffer = secp256k1.signatureExport(secp256k1.sign(digest, swapTestPrivateKey).signature);
  await swap.checkTransactionSignature(signature);
  const params = await btc.getSerializedAddressParameters("49'/0'/0'/0/0");
  console.log(params);
  await expect(swap.checkPayoutAddress(LTCConfig, LTCConfigSignature, params.addressParameters))
    .rejects.toEqual(new Error("Swap application report error INVALID_ADDRESS"));
})


test('Valid payout address should be accepted', async () => {
  jest.setTimeout(100000);
  const transport: Transport<string> = await HttpTransport.open("http://127.0.0.1:9998");
  const swap: Swap = new Swap(transport);
  const btc: Btc = new Btc(transport);
  const transactionId: string  = await swap.startNewTransaction();
  await swap.setPartnerKey(partnerSerializedNameAndPubKey);
  await swap.checkPartner(DERSignatureOfPartnerNameAndPublicKey);
  var tr  = new proto.ledger_swap.NewTransactionResponse();
  tr.setPayinAddress("2324234324324234");
  tr.setPayinExtraId("");
  tr.setRefundAddress("sfdsfdsfsdfdsfsdf");
  tr.setRefundExtraId("");
  tr.setPayoutAddress("LKtSt6xfsmJMkPT8YyViAsDeRh7k8UfNjD");
  tr.setPayoutExtraId("");
  tr.setCurrencyFrom("BTC");
  tr.setCurrencyTo("LTC");
  // 1 BTC to 10 LTC
  tr.setAmountToProvider(numberToBigEndianBuffer(100000000));
  tr.setAmountToWallet(numberToBigEndianBuffer(1000000000));
  tr.setDeviceTransactionId(transactionId);

  const payload: Buffer = Buffer.from(tr.serializeBinary());
  await swap.processTransaction(payload);
  const digest: Buffer = Buffer.from(sha256.sha256.array(payload));
  const signature: Buffer = secp256k1.signatureExport(secp256k1.sign(digest, swapTestPrivateKey).signature);
  await swap.checkTransactionSignature(signature);
  const params = await btc.getSerializedAddressParameters("49'/0'/0'/0/0");
  console.log(params);
  await expect(swap.checkPayoutAddress(LTCConfig, LTCConfigSignature, params.addressParameters)).resolves.toBe(undefined);
})

test('Wrong refund address should be rejected', async () => {
  jest.setTimeout(100000);
  const transport: Transport<string> = await HttpTransport.open("http://127.0.0.1:9998");
  const swap: Swap = new Swap(transport);
  const btc: Btc = new Btc(transport);
  const transactionId: string  = await swap.startNewTransaction();
  await swap.setPartnerKey(partnerSerializedNameAndPubKey);
  await swap.checkPartner(DERSignatureOfPartnerNameAndPublicKey);
  var tr  = new proto.ledger_swap.NewTransactionResponse();
  tr.setPayinAddress("2324234324324234");
  tr.setPayinExtraId("");
  tr.setRefundAddress("sfdsfdsfsdfdsfsdf");
  tr.setRefundExtraId("");
  tr.setPayoutAddress("LKtSt6xfsmJMkPT8YyViAsDeRh7k8UfNjD");
  tr.setPayoutExtraId("");
  tr.setCurrencyFrom("BTC");
  tr.setCurrencyTo("LTC");
  // 1 BTC to 10 LTC
  tr.setAmountToProvider(numberToBigEndianBuffer(100000000));
  tr.setAmountToWallet(numberToBigEndianBuffer(1000000000));
  tr.setDeviceTransactionId(transactionId);

  const payload: Buffer = Buffer.from(tr.serializeBinary());
  await swap.processTransaction(payload);
  const digest: Buffer = Buffer.from(sha256.sha256.array(payload));
  const signature: Buffer = secp256k1.signatureExport(secp256k1.sign(digest, swapTestPrivateKey).signature);
  await swap.checkTransactionSignature(signature);
  const ltcAddressParams = await btc.getSerializedAddressParameters("49'/0'/0'/0/0");
  await swap.checkPayoutAddress(LTCConfig, LTCConfigSignature, ltcAddressParams.addressParameters);

  const btcAddressParams = await btc.getSerializedAddressParameters("84'/0'/0'/1/0", "bech32");
  await expect(swap.checkRefundAddress(BTCConfig, BTCConfigSignature, btcAddressParams.addressParameters))
    .rejects.toEqual(new Error("Swap application report error INVALID_ADDRESS"));
})


test('Valid refund address should be accepted', async () => {
  jest.setTimeout(100000);
  const transport: Transport<string> = await HttpTransport.open("http://127.0.0.1:9998");
  const swap: Swap = new Swap(transport);
  const btc: Btc = new Btc(transport);
  const transactionId: string  = await swap.startNewTransaction();
  await swap.setPartnerKey(partnerSerializedNameAndPubKey);
  await swap.checkPartner(DERSignatureOfPartnerNameAndPublicKey);
  var tr  = new proto.ledger_swap.NewTransactionResponse();
  tr.setPayinAddress("2324234324324234");
  tr.setPayinExtraId("");
  tr.setRefundAddress("bc1qwpgezdcy7g6khsald7cww42lva5g5dmasn6y2z");
  tr.setRefundExtraId("");
  tr.setPayoutAddress("LKtSt6xfsmJMkPT8YyViAsDeRh7k8UfNjD");
  tr.setPayoutExtraId("");
  tr.setCurrencyFrom("BTC");
  tr.setCurrencyTo("LTC");
  // 1 BTC to 10 LTC
  tr.setAmountToProvider(numberToBigEndianBuffer(100000000));
  tr.setAmountToWallet(numberToBigEndianBuffer(1000000000));
  tr.setDeviceTransactionId(transactionId);

  const payload: Buffer = Buffer.from(tr.serializeBinary());
  await swap.processTransaction(payload);
  const digest: Buffer = Buffer.from(sha256.sha256.array(payload));
  const signature: Buffer = secp256k1.signatureExport(secp256k1.sign(digest, swapTestPrivateKey).signature);
  await swap.checkTransactionSignature(signature);
  const ltcAddressParams = await btc.getSerializedAddressParameters("49'/0'/0'/0/0");
  await swap.checkPayoutAddress(LTCConfig, LTCConfigSignature, ltcAddressParams.addressParameters);

  const btcAddressParams = await btc.getSerializedAddressParameters("84'/0'/0'/1/0", "bech32");
  await expect(swap.checkRefundAddress(BTCConfig, BTCConfigSignature, btcAddressParams.addressParameters)).resolves.toBe(undefined);
})
*/

test('Test BTC swap to LTC', async () => {
  jest.setTimeout(100000);

  let transport = await getTransport();
  const swap: Swap = new Swap(transport);
  const transactionId: string  = await swap.startNewTransaction();
  await swap.setPartnerKey(partnerSerializedNameAndPubKey);
  await swap.checkPartner(DERSignatureOfPartnerNameAndPublicKey);
  var tr  = new proto.ledger_swap.NewTransactionResponse();
  tr.setPayinAddress("34dZAvAf1ywuKj1iAydSpPtavigteo1T5G");
  tr.setPayinExtraId("");
  tr.setRefundAddress("bc1qwpgezdcy7g6khsald7cww42lva5g5dmasn6y2z");
  tr.setRefundExtraId("");
  tr.setPayoutAddress("LKtSt6xfsmJMkPT8YyViAsDeRh7k8UfNjD");
  tr.setPayoutExtraId("");
  tr.setCurrencyFrom("BTC");
  tr.setCurrencyTo("LTC");
  tr.setAmountToProvider(numberToBigEndianBuffer(500000));
  tr.setAmountToWallet(numberToBigEndianBuffer(10000000));
  tr.setDeviceTransactionId(transactionId);

  const payload: Buffer = Buffer.from(tr.serializeBinary());
  await swap.processTransaction(payload, 1070);
  const digest: Buffer = Buffer.from(sha256.sha256.array(payload));
  const signature: Buffer = secp256k1.signatureExport(secp256k1.sign(digest, swapTestPrivateKey).signature);
  await swap.checkTransactionSignature(signature);
  const ltcAddressParams = getSerializedAddressParametersBTC("49'/0'/0'/0/0");
  await swap.checkPayoutAddress(LTCConfig, LTCConfigSignature, ltcAddressParams.addressParameters);

  const btcAddressParams = getSerializedAddressParametersBTC("84'/0'/0'/1/0", "bech32");
  await swap.checkRefundAddress(BTCConfig, BTCConfigSignature, btcAddressParams.addressParameters);
  await swap.signCoinTransaction();
  transport.close();

  await new Promise(r => setTimeout(r, 1000));

  transport = await getTransport();

  var
  ans = await transport.send(0xe0, 0x44, 0x00, 0x02, Buffer.from('0100000002', 'hex')); // nVersion + number of inputs
  ans = await transport.send(0xe0, 0x44, 0x80, 0x02, Buffer.from('022d5a8829df3b90a541c8ae609fa9a0436e99b6a78a5c081e77c249ced0df3db200000000409c00000000000000', 'hex'));

  ans = await transport.send(0xe0, 0x44, 0x80, 0x02, Buffer.from('ffffff00', 'hex'));

  ans = await transport.send(0xe0, 0x44, 0x80, 0x02, Buffer.from('0252203e7659e8515db292f18f4aa0235822cb89d5de136c437fe8fca09945822e0000000040420f000000000000', 'hex'));

  ans = await transport.send(0xe0, 0x44, 0x80, 0x02, Buffer.from('ffffff00', 'hex'));

  ans = await transport.send(0xe0, 0x4a, 0xff, 0x00, Buffer.from('058000005480000000800000000000000100000000', 'hex'));

  ans = await transport.send(0xe0, 0x4a, 0x80, 0x00, Buffer.from('0220a107000000000017a9142040cc4169698b7f2f071e4ad14b01458bbc99b08732390800000000001600147051913704F2', 'hex'));
  ans = await transport.send(0xe0, 0x4a, 0x80, 0x00, Buffer.from('356BC3BF6FB0E7555F67688A377D', 'hex'));

  // start signing inputs
  ans = await transport.send(0xe0, 0x44, 0x00, 0x80, Buffer.from('0100000001', 'hex'));

  ans = await transport.send(0xe0, 0x44, 0x80, 0x80, Buffer.from('022d5a8829df3b90a541c8ae609fa9a0436e99b6a78a5c081e77c249ced0df3db200000000409c00000000000019', 'hex'));

  ans = await transport.send(0xe0, 0x44, 0x80, 0x80, Buffer.from('76a914a3f6421206f0448c113b9bb95ca48a70cee23b6888acffffff00', 'hex'));
  ans = await transport.send(0xe0, 0x48, 0x00, 0x00, Buffer.from('058000005480000000800000000000000000000000000000000001', 'hex'));

  console.log(ans);
  transport.close()
})


test('Test ETH swap to BTC', async () => {
  jest.setTimeout(100000);
  let transport = await getTransport();
  //const transport: Transport<string> = await TransportNodeHid.open();
  const swap: Swap = new Swap(transport);
  const transactionId: string  = await swap.startNewTransaction();
  await swap.setPartnerKey(partnerSerializedNameAndPubKey);
  await swap.checkPartner(DERSignatureOfPartnerNameAndPublicKey);
  let tr  = new proto.ledger_swap.NewTransactionResponse();
  tr.setPayinAddress("0xd692Cb1346262F584D17B4B470954501f6715a82");
  tr.setPayinExtraId("");
  tr.setRefundAddress("0xDad77910DbDFdE764fC21FCD4E74D71bBACA6D8D");
  tr.setRefundExtraId("");
  tr.setPayoutAddress("bc1qwpgezdcy7g6khsald7cww42lva5g5dmasn6y2z");
  tr.setPayoutExtraId("");
  tr.setCurrencyFrom("ETH");
  tr.setCurrencyTo("BTC");
  // 1 ETH to 1 BTC
  tr.setAmountToProvider(numberToBigEndianBuffer(1000000 * 1000000 * 1000000 * 1.1234)); // 10^18 wei == 1 ETH
  tr.setAmountToWallet(numberToBigEndianBuffer(100000000));
  tr.setDeviceTransactionId(transactionId);

  const payload: Buffer = Buffer.from(tr.serializeBinary());
  await swap.processTransaction(payload, 840000000000000);
  const digest: Buffer = Buffer.from(sha256.sha256.array(payload));
  const signature: Buffer = secp256k1.signatureExport(secp256k1.sign(digest, swapTestPrivateKey).signature);
  await swap.checkTransactionSignature(signature);
  const btcAddressParams = getSerializedAddressParametersBTC("84'/0'/0'/1/0", "bech32");
  await swap.checkPayoutAddress(BTCConfig, BTCConfigSignature, btcAddressParams.addressParameters);

  const ethAddressParams = getSerializedAddressParametersETH("44'/60'/0'/0/0");
  await swap.checkRefundAddress(ETHConfig, ETHConfigSignature, ethAddressParams.addressParameters);
  await swap.signCoinTransaction();
  transport.close();

  await new Promise(r => setTimeout(r, 5000));

  transport = await getTransport();
  //transport = await TransportNodeHid.open();

  let ans = await transport.send(0xe0, 0x04, 0x00, 0x00, Buffer.from('058000002c8000003c800000000000000000000000ec808509502f900082520894d692cb1346262f584d17b4b470954501f6715a82880f971e5914ac800080018080', 'hex'));
  console.log(ans);
})



test('Test Aeternity ERC20 swap to BTC', async () => {
  jest.setTimeout(100000);
  let transport = await getTransport();
  const swap: Swap = new Swap(transport);
  const transactionId: string  = await swap.startNewTransaction();
  await swap.setPartnerKey(partnerSerializedNameAndPubKey);
  await swap.checkPartner(DERSignatureOfPartnerNameAndPublicKey);
  let tr  = new proto.ledger_swap.NewTransactionResponse();
  tr.setPayinAddress("0xd692Cb1346262F584D17B4B470954501f6715a82");
  tr.setPayinExtraId("");
  tr.setRefundAddress("0xDad77910DbDFdE764fC21FCD4E74D71bBACA6D8D");
  tr.setRefundExtraId("");
  tr.setPayoutAddress("bc1qwpgezdcy7g6khsald7cww42lva5g5dmasn6y2z");
  tr.setPayoutExtraId("");
  tr.setCurrencyFrom("AE");
  tr.setCurrencyTo("BTC");
  // 1.1234 AE to 1 BTC
  tr.setAmountToProvider(numberToBigEndianBuffer(1000000 * 1000000 * 1000000 * 1.1234)); // 10^18 wei == 1 ETH
  tr.setAmountToWallet(numberToBigEndianBuffer(100000000));
  tr.setDeviceTransactionId(transactionId);

  const payload: Buffer = Buffer.from(tr.serializeBinary());
  await swap.processTransaction(payload, 1477845000000000);
  const digest: Buffer = Buffer.from(sha256.sha256.array(payload));
  const signature: Buffer = secp256k1.signatureExport(secp256k1.sign(digest, swapTestPrivateKey).signature);
  await swap.checkTransactionSignature(signature);
  const btcAddressParams = getSerializedAddressParametersBTC("84'/0'/0'/1/0", "bech32");
  await swap.checkPayoutAddress(BTCConfig, BTCConfigSignature, btcAddressParams.addressParameters);

  const aeAddressParams = getSerializedAddressParametersETH("44'/60'/0'/0/0");
  await swap.checkRefundAddress(AEConfig, AEConfigSignature, aeAddressParams.addressParameters);
  await swap.signCoinTransaction();
  transport.close();

  await new Promise(r => setTimeout(r, 5000));

  transport = await getTransport();

  const eth: Eth = new Eth(transport);
  const aeInfo = byContractAddress("0x5CA9a71B1d01849C0a95490Cc00559717fCF0D1d")
  if (aeInfo) await eth.provideERC20TokenInformation(aeInfo)

  let ans = await transport.send(0xe0, 0x04, 0x00, 0x00, Buffer.from('058000002c8000003c800000000000000000000000F8690385098BCA5A00828CCD945CA9a71B1d01849C0a95490Cc00559717fCF0D1d80B844A9059CBB000000000000000000000000d692Cb1346262F584D17B4B470954501f6715a820000000000000000000000000000000000000000000000000F971E5914AC8000038080', 'hex'));
  console.log(ans);
})

