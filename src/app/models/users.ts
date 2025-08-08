export interface UserWithRoles {
  id         : string;
  fullName   : string;
  email      : string;
  phoneNumber?: string;         // <- ahora existe
  isActive   : boolean;
  roles      : string[];
}

export interface UserQuery {
  page:     number;
  pageSize: number;
  role?:    string;
  active?:  boolean;
}

export interface UserUpdate {
  fullName:    string | null | undefined;
  phoneNumber: string | null | undefined;
  isActive:    boolean | null | undefined;
}
