// Holdings
export interface GetTokenAccountsResponse {
  total: number;
  limit: number;
  cursor: string;
  token_accounts: {
    address: string;
    mint: string;
    owner: string;
    amount: number;
    delegated_amount: number;
    frozen: boolean;
  }[];
}
export interface SplTokenHolding {
  address: string;
  mint: string;
  owner: string;
  amount: number;
  delegated_amount: number;
  frozen: boolean;
}
export interface GetWalletTokenHoldingsResponse {
  data: SplTokenHolding[];
  success: boolean;
  msg: string;
}
export interface SplTokenStoreReponse {
  success: boolean;
  added: SplTokenHolding[];
  removed: string[];
  msg: string;
}
export interface getAccountInfoStreamReponse {
  jsonrpc: string;
  method: "accountNotification";
  params: {
    result: {
      context: {
        slot: number;
      };
      value: {
        data: {
          program: string;
          parsed: {
            type: string;
            info: {
              authority: string;
              blockhash: string;
              feeCalculator: {
                lamportsPerSignature: number;
              };
            };
          };
        };
        executable: boolean;
        lamports: number;
        owner: string;
        rentEpoch: number;
        space: number;
      };
    };
    subscription: number;
  };
}
export interface getAccountInfoStreamReponseWithConfirmation extends getAccountInfoStreamReponse {
  id?: string; // Confirmation ID
  result?: null; // Confirmation result
}
export interface DuplicateOwnerMintRecord {
  mint: string;
  owner: string;
}
export interface MintWithOwners {
  mint: string;
  owners: string[];
}
export interface MintWithOwnersResponse {
  success: boolean;
  duplicates: MintWithOwners[];
  msg: string;
}
