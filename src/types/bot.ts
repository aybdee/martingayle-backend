export enum ClientState {
  INACTIVE,
  ACTIVE,
}

export interface Client {
  id: number;
  state: ClientState;
  currentBetAmount: string;
}
