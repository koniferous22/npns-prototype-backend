import { schemaComposer } from 'graphql-compose';

export const MessagePayloadTC = schemaComposer.createObjectTC({
  name: 'MessagePayload',
  fields: {
    message: 'String!'
  }
});
