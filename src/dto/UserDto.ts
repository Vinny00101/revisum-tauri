import User from "@/lib/models/User";

export default class UserDto {
  public readonly id: number;
  public readonly username: string;
  public readonly email: string;
  public readonly avatarPath: string | null;
  public readonly createdAt: string;
  public readonly updatedAt: string;

  constructor(user: User) {
    this.id = user.id;
    this.username = user.username;
    this.email = user.email;
    this.avatarPath = user.avatarPath;
    this.createdAt = user.createdAt.toISOString();
    this.updatedAt = user.updatedAt.toISOString();
  }
}
