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
  let refresh: TToken = request?.headers?.cookie?.split('=')?.at(-1);

  const agent = ((request.headers['user-agent'] ?? '') as string).toLowerCase();
  if (!refresh && (agent?.includes('android') || agent?.includes('ios'))) {
    return { access, refresh: request?.headers?.refreshToken };
  }

  return { access, refresh };
};
