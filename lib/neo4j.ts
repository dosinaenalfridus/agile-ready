import neo4j, { Driver } from 'neo4j-driver';

const uri = process.env.NEO4J_URI || 'bolt://localhost:7687';
const username = process.env.NEO4J_USERNAME || 'neo4j';
const password = process.env.NEO4J_PASSWORD || 'password';

let driver: Driver | undefined;

export const getNeo4jDriver = (): Driver => {
  if (!driver) {
    driver = neo4j.driver(uri, neo4j.auth.basic(username, password));
  }
  return driver;
};
