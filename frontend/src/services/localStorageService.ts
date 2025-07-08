interface User {
  id: string;
  email: string;
  name: string;
}

const USER_KEY = 'user_data';

export const localStorageService = {
  saveUser: (user: User) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  getUser: (): User | null => {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  },

  removeUser: () => {
    localStorage.removeItem(USER_KEY);
  },

  // Mock function to simulate user registration
  registerUser: (email: string, password: string, name: string): User => {
    const newUser: User = {
      id: Date.now().toString(),
      email,
      name,
    };
    localStorageService.saveUser(newUser);
    return newUser;
  },

  // Mock function to simulate user login
  loginUser: (email: string, password: string): User | null => {
    const user = localStorageService.getUser();
    if (user && user.email === email) {
      return user;
    }
    return null;
  },
}; 