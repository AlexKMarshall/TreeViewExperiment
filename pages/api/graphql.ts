// @ts-nocheck

import { ApolloServer, gql } from "apollo-server-micro";

import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { MicroRequest } from "apollo-server-micro/dist/types";
import { MongoDataSource } from "apollo-datasource-mongodb";
import { clientPromise } from "../../mongodb-client";
import { treeId } from ".";

const typeDefs = gql`
  type User {
    id: ID
  }

  type Query {
    getUser: User
    getTrees: [Tree]
  }

  union TreeElement = Tree | Leaf

  type Tree {
    id: ID!
    name: String
    color: String
    children: [TreeElement]
  }

  type Leaf {
    id: ID!
    name: String
    secondaryInformation: String
  }
`;

const resolvers = {
  Query: {
    getUser: () => {
      return {
        id: "Foo",
      };
    },
    getTrees: (a, b, { dataSources }) => {
      return dataSources.trees.getTrees();
    },
  },
  TreeElement: {
    __resolveType(obj, context, info) {
      if (obj.kind === "tree") {
        return "Tree";
      }
      if (obj.kind === "leaf") {
        return "Leaf";
      }
      return null;
    },
  },
};

class Trees extends MongoDataSource {
  async getTrees() {
    const trees = await this.collection.find();
    const unwrappedTrees = await trees.toArray();
    return unwrappedTrees;
  }
}

const buildServer = async () => {
  const client = await clientPromise;
  return new ApolloServer({
    typeDefs,
    resolvers,
    dataSources: () => ({
      trees: new Trees(client.db().collection("treeview")),
    }),
    playground: true,
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
  });
};

// const apolloServer = new ApolloServer({
//   typeDefs,
//   resolvers,
//   dataSources: () => ({
//     trees: new Trees(
//       clientPromise.then((client) => client.db().collection("treeview"))
//     ),
//   }),
//   playground: true,
//   plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
// });

export default async function handler(req: MicroRequest, res: any) {
  const apolloServer = await buildServer();
  await apolloServer.start();
  await apolloServer.createHandler({
    path: "/api/graphql",
  })(req, res);
}

export const config = {
  api: {
    bodyParser: false,
  },
};
