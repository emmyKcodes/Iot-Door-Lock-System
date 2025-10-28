export interface DoorState {
  isLocked: boolean;
  isDisabled: boolean;
  pin: string;
  lastChanged: string | null;
}

export type DoorAction = "lock" | "unlock" | "disable" | "enable" | "changePin";

export interface DoorContextType {
  doorState: DoorState;
  lockDoor: () => Promise<void>;
  unlockDoor: () => Promise<void>;
  toggleDisabled: () => void;
  changePin: (newPin: string) => void;
  isLoading: boolean;
}
