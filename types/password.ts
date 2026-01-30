export interface PasswordEntry {
  id: string;
  title: string;
  username: string;
  password: string;
  website?: string;
  notes?: string;
  category?: string;
  createdAt: number;
  updatedAt: number;
}

export interface PasswordVault {
  entries: PasswordEntry[];
  lastModified: number;
}

export interface User {
  hashedMasterPassword: string;
  createdAt: number;
}
