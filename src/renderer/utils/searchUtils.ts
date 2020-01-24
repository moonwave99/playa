const QUERY_REGEX = /(artist|year|type):\s+/g

const QUERY_FIELDS: {[key: string]: string} = {
  artist: 'string',
  year: 'number',
  type: 'string'
}

export type Query = {
  query: string;
  selector?: { [key: string]: string|number };
}

export function parseQuery(query: string): Query {
  const tokens = query.match(QUERY_REGEX);
  if (!tokens) {
    return {
      query,
    };
  }

  let queryToParse = query;
  const generatedQuery: Query = {
    query: '',
    selector: {}
  };

  for (let i = tokens.length - 1; i >= 0; i--) {
    const key = tokens[i].split(':').shift();
    const splitQuery = queryToParse.split(tokens[i]);
    const value = splitQuery.pop().trim();
    queryToParse = splitQuery.join(tokens[i]);
    generatedQuery.selector[key] =
      QUERY_FIELDS[key] === 'number'
        ? +value
        : value;
    if (i === 0) {
      generatedQuery.query = queryToParse.trim();
    }
  }
  return generatedQuery;
}
