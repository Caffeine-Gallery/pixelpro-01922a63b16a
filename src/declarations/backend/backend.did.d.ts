import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type Result = { 'ok' : null } |
  { 'err' : string };
export type Result_1 = { 'ok' : Uint8Array | number[] } |
  { 'err' : string };
export interface _SERVICE {
  'clearAllImages' : ActorMethod<[], undefined>,
  'deleteImage' : ActorMethod<[string], Result>,
  'getImage' : ActorMethod<[string], Result_1>,
  'getStorageUsage' : ActorMethod<[], bigint>,
  'listImages' : ActorMethod<[], Array<string>>,
  'uploadImage' : ActorMethod<[string, Uint8Array | number[]], Result>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
