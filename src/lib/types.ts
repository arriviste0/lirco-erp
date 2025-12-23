export type Email = {
  id: string;
  from: {
    name: string;
    email: string;
    avatar: string;
  };
  to: string;
  subject: string;
  body: string;
  date: string;
  read: boolean;
};
