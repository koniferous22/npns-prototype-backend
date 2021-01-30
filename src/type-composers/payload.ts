import { schemaComposer } from 'graphql-compose';

export const MessagePayloadTC = schemaComposer.createObjectTC({
  name: 'MessagePayload',
  fields: {
    message: 'String!'
  }
});

export const ValidationPayloadTC = schemaComposer.createObjectTC({
  name: 'ValidationPayload',
  fields: {
    result: 'Boolean!'
  }
});
