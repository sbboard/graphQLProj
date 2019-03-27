import * as path from 'path'
import { queryType, stringArg, idArg, makeSchema } from 'nexus'
import { GraphQLServer } from 'graphql-yoga'
import { makePrismaSchema, prismaObjectType } from 'nexus-prisma'
import { prisma } from './generated/prisma-client'
import datamodelInfo from './generated/nexus-prisma'
import { isContext } from 'vm';

const Query = queryType({
    definition(t) {
      t.string('hello', {
        args: { name: stringArg({ nullable: true }) },
        resolve: (parent, { name }) => `Hello ${name || 'World'}!`,
      })
    },
  })
const Mutation = prismaObjectType({ 
    name: 'Mutation',
    definition(t){
        t.prismaFields(['*'])
        t.field('makeNewTeam', {
            type: 'Team',
            args: {
                name: stringArg()
            },
            resolve: (parent, { name }, ctx) => {
                return ctx.prisma.createTeam({name})
            }
        })
    }
})

//////////////////////////////////////////
const Hero = prismaObjectType({
    name: 'Hero',
    definition(t) {
      t.prismaFields(['*'])
    }
})
const Baddie = prismaObjectType({
    name: 'Baddie',
    definition(t) {
      t.prismaFields(['*'])
    }
})
const Team = prismaObjectType({
    name: 'Team',
    definition(t) {
      t.prismaFields(['*'])
    }
})

const schema = makePrismaSchema({
  types: [Query, Mutation, Baddie, Hero, Team],

  prisma: {
    datamodelInfo,
    client: prisma
  },

  outputs: {
    schema: path.join(__dirname, './generated/schema.graphql'),
    typegen: path.join(__dirname, './generated/nexus.ts'),
  },
})

const server = new GraphQLServer({
  schema,
  context: { prisma }
})
server.start(() => console.log(`Server is running on http://localhost:4000`))