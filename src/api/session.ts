import { computed, ComputedRef, inject, provide, ref, shallowRef, watch } from 'vue';
import { LocationQueryValue, useRoute, useRouter } from 'vue-router';
import {
  AuthenticationResultType,
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  RespondToAuthChallengeCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import { fromCognitoIdentityPool, FromCognitoIdentityPoolParameters } from '@aws-sdk/credential-provider-cognito-identity';
import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';

const region = 'us-east-1';
const userPoolId = 'us-east-1_SuRPBCz7B';

const client = new CognitoIdentityProviderClient({
  region,
});

const ClientId = '5tis9es006p360koekldka4hbb';
const sessionCommandsKey = Symbol();
const signInStatusKey = Symbol();

interface Tokens {
  AccessToken: string;
  IdToken: string;
  RefreshToken: string;
  Expires: number;
}

function getInitialState(): Tokens | undefined {
  const AccessToken = localStorage.getItem('CognitoAccessToken');
  return AccessToken ? {
    AccessToken,
    IdToken: localStorage.getItem('CognitoIdToken')!,
    RefreshToken: localStorage.getItem('CognitoRefreshToken')!,
    Expires: parseInt(localStorage.getItem('CognitoExpires')!, 10),
  } : undefined;
}

interface SessionCommands {
  isSignedIn: ComputedRef<boolean>;
  signIn: (username: string, password: string) => Promise<boolean>;
  signOut: () => void;
  newPasswordRequired: (username: string, password: string, session: string) => Promise<void>;
  confirmForgotPassword: (username: string, password: string, confirmationCode: string) => Promise<void>;
  forgotPassword: (username: string) => Promise<void>;
  runLambda: <T>(name: string, body: unknown) => Promise<T>;
}

export function provideSession(): SessionCommands {
  const route = useRoute();
  const router = useRouter();

  const tokens = shallowRef(getInitialState());
  const isSignedIn = computed(() => import.meta.env.DEV ? true : !!tokens.value);

  const lambdaClient = computed(() => {
    const credentials: FromCognitoIdentityPoolParameters = {
      client: new CognitoIdentityClient({ region }),
      identityPoolId: 'us-east-1:12930fac-7899-4ee7-9b4b-a3b29df16da1',
    };
    const currentTokens = tokens.value;
    if (currentTokens) {
      credentials.logins = {
        [`cognito-idp.${region}.amazonaws.com/${userPoolId}`]: currentTokens.IdToken,
      };
    }
    return new LambdaClient({
      region,
      credentials: fromCognitoIdentityPool(credentials),
    });
  });

  watch(tokens, value => {
    if (value) {
      localStorage.setItem('CognitoAccessToken', value.AccessToken);
      localStorage.setItem('CognitoIdToken', value.IdToken);
      localStorage.setItem('CognitoRefreshToken', value.RefreshToken);
      localStorage.setItem('CognitoExpires', value.Expires+'');
    } else {
      localStorage.removeItem('CognitoAccessToken');
      localStorage.removeItem('CognitoIdToken');
      localStorage.removeItem('CognitoRefreshToken');
      localStorage.removeItem('CognitoExpires');
    }
  });

  const setTokens = (auth: AuthenticationResultType) => {
    const { AccessToken, IdToken, RefreshToken, ExpiresIn } = auth;
    tokens.value = {
      AccessToken: AccessToken!,
      IdToken: IdToken!,
      RefreshToken: RefreshToken!,
      Expires: Date.now() + (ExpiresIn! - 10) * 1000,
    };
  }

  const checkRefresh = async () => {
    const currentTokens = tokens.value;
    const expires = currentTokens?.Expires;
    if (!expires || expires >= Date.now()) {
      // No need
      return;
    }
    const { AuthenticationResult, ChallengeName } = await client.send(new InitiateAuthCommand({
      AuthFlow: 'REFRESH_TOKEN_AUTH',
      ClientId,
      AuthParameters: {
        REFRESH_TOKEN: currentTokens!.RefreshToken,
      },
    }));
    if (!ChallengeName) {
      setTokens(AuthenticationResult!);
    } else {
      console.error(`Unexpected challenge: ${ChallengeName}`);
      throw new Error;
    }
  }

  const signIn = async (username: string, password: string) => {
    const { AuthenticationResult, ChallengeName, Session } = await client.send(new InitiateAuthCommand({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId,
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password,
      },
    }));
    const { redirect } = route.query as Record<string, LocationQueryValue>;
    if (!ChallengeName) {
      setTokens(AuthenticationResult!);
      router.push(redirect || '/');
      return true;
    } else if (ChallengeName === 'NEW_PASSWORD_REQUIRED') {
      router.push({
        path: '/login/new-password',
        query: {
          session: Session,
          username,
          redirect,
        },
      });
      return false;
    } else {
      console.error(`Unexpected challenge: ${ChallengeName}`);
      throw new Error;
    }
  }

  const signOut = () => {
    tokens.value = undefined;
  }

  const newPasswordRequired = async (username: string, password: string, session: string) => {
    const { AuthenticationResult, ChallengeName } = await client.send(new RespondToAuthChallengeCommand({
      ClientId,
      ChallengeName: 'NEW_PASSWORD_REQUIRED',
      ChallengeResponses: {
        USERNAME: username,
        NEW_PASSWORD: password,
      },
      Session: session,
    }));
    if (!ChallengeName) {
      setTokens(AuthenticationResult!);
      router.push(route.query.redirect as LocationQueryValue || '/');
    } else {
      console.error(`Unexpected challenge: ${ChallengeName}`);
      throw new Error;
    }
  }

  const forgotPassword = async (username: string) => {
    await client.send(new ForgotPasswordCommand({
      ClientId,
      Username: username,
    }));
  };

  const confirmForgotPassword = async (username: string, password: string, confirmationCode: string) => {
    await client.send(new ConfirmForgotPasswordCommand({
      ClientId,
      ConfirmationCode: confirmationCode,
      Username: username,
      Password: password,
    }));
  };

  const provided = {
    isSignedIn,
    signIn,
    signOut,
    newPasswordRequired,
    forgotPassword,
    confirmForgotPassword,
    runLambda: import.meta.env.DEV
      ? async <T>(name: string, body: unknown) => {
        const headers = new Headers();
        headers.append('Accept', 'application/json');
        headers.append('Content-Type', 'application/json');
        return fetch('http://localhost:8020/test-invocations', {
          method: 'POST',
          headers,
          body: JSON.stringify({ name, body }),
        }).then(response => response.status < 400 ? response.json() as Promise<T> : Promise.reject(new Error));
      }
      : async <T>(name: string, body: unknown) => {
        await checkRefresh();
        const response = await lambdaClient.value.send(new InvokeCommand({
          FunctionName: name,
          InvocationType: 'RequestResponse',
          Payload: new TextEncoder().encode(JSON.stringify(body)),
          LogType: 'None'
        }));
        return JSON.parse(
          new TextDecoder().decode(response.Payload),
        ) as T;
      },
  }
  provide<SessionCommands>(sessionCommandsKey, provided);
  provide<ComputedRef<boolean>>(signInStatusKey, isSignedIn);
  return provided;
}

export function useSession() {
  return inject(sessionCommandsKey) as SessionCommands;
}

export function useSignInStatus() {
  return inject(signInStatusKey) as ComputedRef<boolean>;
}
