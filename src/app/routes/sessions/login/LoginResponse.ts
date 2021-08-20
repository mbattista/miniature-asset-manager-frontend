export class LoginResponse {
  id: number;
  username: string;
  token?: string;
  first_name: string;
  last_name: string;
  admin: boolean;
  per_page_preference: number;
}
