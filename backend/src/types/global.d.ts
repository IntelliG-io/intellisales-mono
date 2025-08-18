declare global {
  namespace Express {
    interface Request {
      id?: string;
      log?: any;
    }
    interface Response {
      log?: any;
    }
  }
}

// Minimal declaration to satisfy TS if type resolution fails
declare module 'pino-http' {
  type RequestHandler = (req: any, res: any, next: any) => void;
  const pinoHttp: (options?: any) => RequestHandler;
  export default pinoHttp;
}
