export interface IUser {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "TRAINER" | "TRAINEE";
}

export interface ILoginResponse {
  user: IUser;
  token: string;
}
