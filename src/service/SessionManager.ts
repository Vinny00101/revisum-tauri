import UserDto from "@/dto/UserDto";

export default class SessionManager {
  private currentUser: UserDto | null = null;

  login(user: UserDto) {
    this.currentUser = user;
  }

  logout() {
    this.currentUser = null;
  }

  getUser(): UserDto | null {
    return this.currentUser;
  }

  isLogged(): boolean {
    return this.currentUser !== null;
  }
}
