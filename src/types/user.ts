
export type UserRole = 'Administrador' | 'Vendedor' | 'Inventarista' | 'Consultor';

export interface User {
  id: string;
  name: string;
  businessName: string;
  pin: string;
  logoUrl?: string;
  role: UserRole;
  isActive: boolean;
  currency?: string;
  language?: string;
}

export type UserFormData = Omit<User, 'id' | 'role' | 'isActive'>;
