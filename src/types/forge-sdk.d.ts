declare module "forge-sdk" {
  export function forgeRequest(endpoint: string, payload: any): Promise<any>;
}
