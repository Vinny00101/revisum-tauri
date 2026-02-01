import BaseEntity from "./BaseEntity";

export default class User extends BaseEntity {
  public readonly username: string;
  public readonly email: string;
  public readonly passwordHash: string;
  public readonly avatarPath: string | null;

  private constructor(
    id: number,
    username: string,
    email: string,
    passwordHash: string,
    avatarPath: string | null,
    createdAt: Date,
    updatedAt: Date
  ) {
    super(id, createdAt, updatedAt);
    this.username = username;
    this.email = email;
    this.passwordHash = passwordHash;
    this.avatarPath = avatarPath;
  }

  static create(
    id: number,
    username: string,
    email: string,
    passwordHash: string,
    avatarPath: string | null,
    createdAt: Date,
    updatedAt: Date
  ): User {
    return new User(
      id,
      username,
      email,
      passwordHash,
      avatarPath,
      createdAt,
      updatedAt
    );
  }
}
