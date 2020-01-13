import {
  toObj,
  removeIds,
  ensureAll
} from './store';

const entitiesArray = [
  { _id: '1', value: 'a' },
  { _id: '2', value: 'b' },
  { _id: '3', value: 'c' }
];

const entitiesObject = {
  '1': { _id: '1', value: 'a' },
  '2': { _id: '2', value: 'b' },
  '3': { _id: '3', value: 'c' }
};

describe('toObj', () => {
  it('should convert an array to an EntityHashMap', () => {
    expect(toObj(entitiesArray)).toEqual(entitiesObject);
  });
});

describe('removeIds', () => {
  it('should return the original EntityHashMap if the list is empty', () => {
    expect(removeIds(entitiesObject, [])).toEqual(entitiesObject);
  });
  it('should return an EntityHashMap without the given list of ids', () => {
    expect(removeIds(entitiesObject, ['1', '2'])).toEqual({ '3': entitiesObject['3'] });
  });
  it('should return the original EntityHashMap if no ids are found', () => {
    expect(removeIds(entitiesObject, ['6', '7', '8'])).toEqual(entitiesObject);
  });
});

describe('ensureAll', () => {
  it('should ensure that every passed entity has the fields of the default entity', () => {
    type TestEntity = {
      a: string;
      b: number;
      c: string[];
    }
    const defaultValues = {
      a: 'abc',
      b: 123,
      c: ['a', 'b', 'c']
    };
    function getTestDefault(obj: object): TestEntity {
      return {...defaultValues, ...obj};
    }
    const objs = [{
      a: 'abc',
      b: 123,
    }, {
      a: 'abc',
      c: ['a', 'b', 'c']
    }, {
      b: 123,
      c: ['a', 'b', 'c']
    }];
    const ensured = ensureAll<TestEntity>(objs, getTestDefault);
    ensured.forEach((x) => {
      expect(x).toEqual(expect.objectContaining(defaultValues));
    })
  });
});
