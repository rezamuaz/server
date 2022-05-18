import  defaultFieldResolver  from 'graphql';
import SchemaDirectiveVisitor from 'graphql-tools'

import { ApolloError } from 'apollo-server-express';
 class IsAuthDirective extends SchemaDirectiveVisitor {
	visitFieldDefinition (field) {
		const { resolve = defaultFieldResolver } = field;

		field.resolve = async function (...args) {
			let [ _, {}, { user, isAuth } ] = args;
			if (isAuth) {
				const result = await resolve.apply(this, args);
				return result;
			} else {
				throw new ApolloError('You must be the authenticated user to get this information');
			}
		};
	}
}

module.exports = IsAuthDirective
