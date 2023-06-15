import { UserType } from "src/user/type/user-type.enum";

export interface AuthUser {
  id: string;
  isAdmin?: boolean;
  type: UserType;
  isNew?: boolean;
}
