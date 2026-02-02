declare module "google-auth-library" {
  export interface JWT {
    authorize(): Promise<void>;
  }
  
  export class JWT implements JWT {
    constructor(options: {
      email: string;
      key: string;
      scopes: string[];
    });
  }
}
