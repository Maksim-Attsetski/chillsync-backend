type TToken = string | undefined;

interface IResponse {
  refresh: TToken;
  access: TToken;
}

export const getTokenFromRequest = (request: any): IResponse => {
  const access: TToken = (
    request?.headers?.authorization ?? request?.headers?.Authorization
  )
    ?.split(' ')
    ?.at(-1);
  const refresh: TToken = request?.headers?.cookie?.split('=')?.at(-1);

  return { access, refresh };
};
