// @ts-nocheck

import { ApolloServer, gql } from "apollo-server-micro";

import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { MicroRequest } from "apollo-server-micro/dist/types";
import { MongoDataSource } from "apollo-datasource-mongodb";
import { clientPromise } from "../../mongodb-client";

const typeDefs = gql`
  type Query {
    getTrees: [Tree]
    getTree(id: ID): Tree
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
    getTrees: (a, b, { dataSources }) => {
      return dataSources.trees.getTrees();
    },
    getTree: (parent, { id }, { dataSources }) => {
      return dataSources.trees.getTree(id);
    },
  },
  TreeElement: {
    __resolveType(obj, context, info) {
      if (obj.type === "tree") {
        return "Tree";
      }
      if (obj.type === "leaf") {
        return "Leaf";
      }
      return "Tree";
    },
  },
};

class Trees extends MongoDataSource {
  async getTrees() {
    const trees = await this.collection.find();
    const unwrappedTrees = await trees.toArray();
    return unwrappedTrees;
  }
  getTree(id) {
    return this.collection.findOne({ id });
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
