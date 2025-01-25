export interface Resolution {
  label: string;
  width: number;
  height: number;
}

export interface Recording {
  id: string;
  blob: Blob;
  timestamp: Date;
}