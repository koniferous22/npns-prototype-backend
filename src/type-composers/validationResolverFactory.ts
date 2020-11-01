import mongoose from 'mongoose';
import { ArgsType, MaybePromise } from '../utilTypes';
import { MessagePayloadTC } from './payload';

type ValidationResult = string | boolean
export const validationResolverFactory = <TCType>({ name, args, validationFn, defaultErrorMessage }: {
  name: string;
  args: ArgsType<TCType>;
  validationFn: (args: ArgsType<TCType>) => MaybePromise<ValidationResult>;
  defaultErrorMessage?: string;
}) => ({
  name,
  args,
  type: 'Boolean!',
  resolve: async ({ args }: { args: ArgsType<TCType>}) => {
    const validationResult = await validationFn(args);
    if (validationResult !== true) {
      throw new Error(validationResult || 'Validation failed');
    }
    return true
  }
});
