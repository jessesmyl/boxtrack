// Human-friendly box name: "Kitchen Box 1" once a room is set, else "Box 1".
export function boxName(room: string | null | undefined, label: number) {
  return room ? `${room} Box ${label}` : `Box ${label}`;
}
