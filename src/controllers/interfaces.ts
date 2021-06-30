export interface CreateRoomArgs {
  maxParticipants?: number;
}

export interface GetRoomArgs {
  shareId: string;
}

export interface GetGameUserArgs {
  id: string;
}
