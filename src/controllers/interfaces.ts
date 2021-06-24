export interface CreateRoomArgs {
  maxParticipants?: string;
}

export interface GetRoomArgs {
  shareId: string;
}

export interface GetGameUserArgs {
  id: string;
}
