import { ObjectTypeComposer } from 'graphql-compose';

export type MaybePromise<T> = T | Promise<T>
export type ArgsType<TCType, SrcType = any, ContextType = any> = TCType extends ObjectTypeComposer<SrcType, ContextType>
  ? Parameters<TCType['addResolver']>[0]['args']
  : never;
