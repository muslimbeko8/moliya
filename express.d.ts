import { User } from './path-to-your-user-entity'; // Adjust the path as necessary

declare global {
  namespace Express {
    interface Request {
      user?: User; // Assuming `User` is your user type
    }
  }
}
