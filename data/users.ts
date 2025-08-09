export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  username: string;
  timezone: string;
  bio?: string;
  company?: string;
  website?: string;
}

export const currentUser: User = {
  id: "1",
  name: "Juan Pérez",
  email: "juan@example.com",
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  username: "juanperez",
  timezone: "America/Mexico_City",
  bio: "Gerente de producto en TechCorp. Apasionado por crear productos increíbles.",
  company: "TechCorp",
  website: "https://juanperez.dev"
};

export const users: User[] = [
  currentUser,
  {
    id: "2",
    name: "Sarah Wilson",
    email: "sarah@example.com",
    username: "sarahwilson",
    timezone: "Europe/London",
    bio: "UX Designer specializing in user research and interface design."
  }
];