
import { useState, useEffect } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
}

export class UserService {
  private users: User[] = [];

  async fetchUsers() {
    try {
      const response = await fetch('/api/users');
      this.users = await response.json();
      return this.users;
    } catch (error) {
      console.error('Failed to fetch users:', error);
      return [];
    }
  }

  getUserById(id: number) {
    return this.users.find(user => user.id === id);
  }
}

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      const userService = new UserService();
      const fetchedUsers = await userService.fetchUsers();
      setUsers(fetchedUsers);
      setLoading(false);
    };

    loadUsers();
  }, []);

  return { users, loading };
};
    