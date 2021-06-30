export interface CreateRoomArgs {
  maxParticipants?: number;
}

export interface GetRoomArgs {
  shareId: string;
}

export interface CreateGameUserArgs extends GetRoomArgs {
  isAdmin?: boolean;
}

export interface GetGameUserArgs {
  id: string;
}
