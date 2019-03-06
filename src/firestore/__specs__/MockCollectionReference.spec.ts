import { MockFirebaseApp } from 'firebaseApp';
import { MockCollectionReference } from 'firestore/MockCollectionReference';
import MockDocumentReference from 'firestore/MockDocumentReference';
import { MockFirebaseValidationError } from '../utils/index';
import { MockDatabase } from '../index';

describe('CollectionReferenceMock', () => {
  describe('References', () => {
    it('doc() returns a document by id', () => {
      const app = new MockFirebaseApp();
      const firestore = app.firestore();

      const collection = new MockCollectionReference(firestore, 'test', null);
      firestore.root.mocker.setCollection(collection);

      const document = new MockDocumentReference(firestore, 'doc', collection);
      collection.mocker.setDoc(document);

      expect(collection.doc('doc')).toBe(document);
    });

    it('doc() call without an id will return document reference with autogenerated id', () => {
      const app = new MockFirebaseApp();
      const firestore = app.firestore();

      const collection = new MockCollectionReference(firestore, 'test', null);
      firestore.root.mocker.setCollection(collection);

      const document = new MockDocumentReference(firestore, 'doc', collection);
      collection.mocker.setDoc(document);

      expect(collection.doc().id).toBeDefined();
    });
  });

  describe('add()', () => {
    it('will create a new document with a generated id', async () => {
      const app = new MockFirebaseApp();
      const firestore = app.firestore();

      const collection = new MockCollectionReference(firestore, 'test', null);
      firestore.root.mocker.setCollection(collection);

      const data = {
        test: 'data',
      };

      const document = await collection.add(data);

      expect(document).toBeDefined();
      expect(document.id).toBeDefined();
    });
  });

  const testData = {
    list: {
      docs: {
        c: {
          data: { name: 'c' },
        },
        b: {
          data: { name: 'b' },
        },
        a: {
          data: { name: 'a' },
        },
      },
    },
  };

  const testData2 = {
    list: {
      docs: {
        a: {
          data: { name: 'a' },
        },
        b: {
          data: { name: 'b', key: 'm' },
        },
        c: {
          data: { name: 'c', key: 'm' },
        },
        d: {
          data: { name: 'b' },
        },
      },
    },
  };

  describe('get()', () => {
    it('will get all documents', async () => {
      const app = new MockFirebaseApp();
      const firestore = app.firestore();
      firestore.mocker.fromMockDatabase(testData);
      const query = await firestore.collection('list').get();

      expect(query).toBeDefined();
      expect(query.size).toBe(3);
      expect(query.docs[0].data()).toEqual({
        name: 'c',
      });
      expect(query.docs[2].data()).toEqual({
        name: 'a',
      });
    });
  });

  describe('limit()', () => {
    it('will return max number of documents defined by limit', async () => {
      const app = new MockFirebaseApp();
      const firestore = app.firestore();
      firestore.mocker.fromMockDatabase(testData);
      const query = await firestore
        .collection('list')
        .orderBy('name')
        .limit(2)
        .get();

      expect(query).toBeDefined();
      expect(query.size).toBe(2);
      expect(query.docs[0].data()).toEqual({
        name: 'a',
      });
      expect(query.docs[1].data()).toEqual({
        name: 'b',
      });
    });

    it('will give an error if limit is zero or negative', () => {
      const app = new MockFirebaseApp();
      const firestore = app.firestore();
      firestore.mocker.fromMockDatabase(testData);

      expect(() =>
        firestore
          .collection('list')
          .orderBy('name')
          .limit(-2),
      ).toThrow();

      expect(() =>
        firestore
          .collection('list')
          .orderBy('name')
          .limit(0),
      ).toThrow();
    });
  });

  describe('orderBy()', () => {
    it('will return documents in ascending order as default', async () => {
      const app = new MockFirebaseApp();
      const firestore = app.firestore();
      firestore.mocker.fromMockDatabase(testData);
      const query = await firestore
        .collection('list')
        .orderBy('name')
        .get();

      expect(query).toBeDefined();
      expect(query.size).toBe(3);
      expect(query.docs[0].data()).toEqual({
        name: 'a',
      });
      expect(query.docs[1].data()).toEqual({
        name: 'b',
      });
      expect(query.docs[2].data()).toEqual({
        name: 'c',
      });
    });

    it('will return documents in ascending order as explicitly', async () => {
      const app = new MockFirebaseApp();
      const firestore = app.firestore();
      firestore.mocker.fromMockDatabase(testData);
      const query = await firestore
        .collection('list')
        .orderBy('name', 'asc')
        .get();

      expect(query).toBeDefined();
      expect(query.size).toBe(3);
      expect(query.docs[0].data()).toEqual({
        name: 'a',
      });
      expect(query.docs[1].data()).toEqual({
        name: 'b',
      });
      expect(query.docs[2].data()).toEqual({
        name: 'c',
      });
    });

    it('will return documents in descending order explicitly', async () => {
      const app = new MockFirebaseApp();
      const firestore = app.firestore();
      firestore.mocker.fromMockDatabase(testData);
      const query = await firestore
        .collection('list')
        .orderBy('name', 'desc')
        .get();

      expect(query).toBeDefined();
      expect(query.size).toBe(3);
      expect(query.docs[0].data()).toEqual({
        name: 'c',
      });
      expect(query.docs[1].data()).toEqual({
        name: 'b',
      });
      expect(query.docs[2].data()).toEqual({
        name: 'a',
      });
    });

    it('will return documents in descending order explicitly', async () => {
      const app = new MockFirebaseApp();
      const firestore = app.firestore();
      firestore.mocker.fromMockDatabase(testData);
      const query = await firestore
        .collection('list')
        .orderBy('name', 'desc')
        .get();

      expect(query).toBeDefined();
      expect(query.size).toBe(3);
      expect(query.docs[0].data()).toEqual({
        name: 'c',
      });
      expect(query.docs[1].data()).toEqual({
        name: 'b',
      });
      expect(query.docs[2].data()).toEqual({
        name: 'a',
      });
    });

    // TODO ordering by multiple fields
  });

  describe('where()', () => {
    describe('equality', () => {
      it('will return fields with a equal match', async () => {
        const firestore = new MockFirebaseApp().firestore();
        firestore.mocker.fromMockDatabase(testData2);
        const query = await firestore
          .collection('list')
          .where('key', '==', 'm')
          .get();

        expect(query).toBeDefined();
        expect(query.size).toBe(2);
        expect(query.docs[0].data()).toEqual({
          name: 'b',
          key: 'm',
        });
        expect(query.docs[1].data()).toEqual({
          name: 'c',
          key: 'm',
        });
      });
    });
    describe('comparization', () => {
      const testData3 = {
        list: {
          docs: {
            a: {
              data: {
                name: 'a',
                value: 5,
              },
            },
            b: {
              data: {
                name: 'b',
                value: 2,
              },
            },
            c: {
              data: {
                name: 'c',
                value: 10,
              },
            },
            d: {
              data: {
                name: 'd',
                value: 20,
              },
            },
          },
        },
      };

      it('will return fields with less than', async () => {
        const app = new MockFirebaseApp();
        const firestore = app.firestore();
        firestore.mocker.fromMockDatabase(testData3);
        const query = await firestore
          .collection('list')
          .where('value', '<', 10)
          .get();

        expect(query).toBeDefined();
        expect(query.size).toBe(2);
        expect(query.docs[0].data()).toEqual({
          name: 'a',
          value: 5,
        });
        expect(query.docs[1].data()).toEqual({
          name: 'b',
          value: 2,
        });
      });

      it('will return fields with less or equal', async () => {
        const app = new MockFirebaseApp();
        const firestore = app.firestore();
        firestore.mocker.fromMockDatabase(testData3);
        const query = await firestore
          .collection('list')
          .where('value', '<=', 10)
          .get();

        expect(query).toBeDefined();
        expect(query.size).toBe(3);
        expect(query.docs[0].data()).toEqual({
          name: 'a',
          value: 5,
        });
        expect(query.docs[1].data()).toEqual({
          name: 'b',
          value: 2,
        });
        expect(query.docs[2].data()).toEqual({
          name: 'c',
          value: 10,
        });
      });

      it('will return fields greater than', async () => {
        const app = new MockFirebaseApp();
        const firestore = app.firestore();
        firestore.mocker.fromMockDatabase(testData3);
        const query = await firestore
          .collection('list')
          .where('value', '>', 10)
          .get();

        expect(query).toBeDefined();
        expect(query.size).toBe(1);
        expect(query.docs[0].data()).toEqual({
          name: 'd',
          value: 20,
        });
      });

      it('will return fields greater or equal', async () => {
        const app = new MockFirebaseApp();
        const firestore = app.firestore();
        firestore.mocker.fromMockDatabase(testData3);
        const query = await firestore
          .collection('list')
          .where('value', '>=', 10)
          .get();

        expect(query).toBeDefined();
        expect(query.size).toBe(2);
        expect(query.docs[0].data()).toEqual({
          name: 'c',
          value: 10,
        });
        expect(query.docs[1].data()).toEqual({
          name: 'd',
          value: 20,
        });
      });

      it('will return fields between', async () => {
        const app = new MockFirebaseApp();
        const firestore = app.firestore();
        firestore.mocker.fromMockDatabase(testData3);
        const query = await firestore
          .collection('list')
          .where('value', '>=', 5)
          .where('value', '<', 15)
          .get();

        expect(query).toBeDefined();
        expect(query.size).toBe(2);
        expect(query.docs[0].data()).toEqual({
          name: 'a',
          value: 5,
        });
        expect(query.docs[1].data()).toEqual({
          name: 'c',
          value: 10,
        });
      });
    });

    describe('array checks', () => {
      const testData4 = {
        list: {
          docs: {
            a: {
              data: {
                name: 'a',
                values: [2, 5, 6],
              },
            },
            b: {
              data: {
                name: 'b',
                values: [2, 1, 7],
              },
            },
            c: {
              data: {
                name: 'c',
                values: [1, 5, 8],
              },
            },
          },
        },
      };

      it('is in array match', async () => {
        const app = new MockFirebaseApp();
        const firestore = app.firestore();
        firestore.mocker.fromMockDatabase(testData4);
        const query = await firestore
          .collection('list')
          .where('values', 'array-contains', 5)
          .get();

        expect(query).toBeDefined();
        expect(query.size).toBe(2);
        expect(query.docs[0].data()).toEqual({
          name: 'a',
          values: [2, 5, 6],
        });
        expect(query.docs[1].data()).toEqual({
          name: 'c',
          values: [1, 5, 8],
        });
      });

      it('is not in array match', async () => {
        const app = new MockFirebaseApp();
        const firestore = app.firestore();
        firestore.mocker.fromMockDatabase(testData4);
        const query = await firestore
          .collection('list')
          .where('values', 'array-contains', 55)
          .get();

        expect(query).toBeDefined();
        expect(query.size).toBe(0);
      });

      it('will throw error when matching non array field', () => {
        const app = new MockFirebaseApp();
        const firestore = app.firestore();
        firestore.mocker.fromMockDatabase(testData4);

        const crash = () => {
          firestore
            .collection('list')
            .where('name', 'array-contains', 2)
            .get()
            .catch(error => {
              // excpect call to fail. Raise the error further for jest
              throw error;
            });
        };

        expect(crash).toThrowError(MockFirebaseValidationError);
      });
    });

    describe('paging', () => {
      const database: MockDatabase = {
        list: {
          docs: {
            a: {
              data: {
                name: 'Blueberry',
                value: 1,
              },
            },
            b: {
              data: {
                name: 'Strowberry',
                value: 2,
              },
            },
            c: {
              data: {
                name: 'Rasberry',
                value: 3,
              },
            },
            d: {
              data: {
                name: 'Cloudberry',
                value: 4,
              },
            },
            e: {
              data: {
                name: 'Lingonberry',
                value: 4,
              },
            },
          },
        },
      };

      it('will limit the result to startAt cursor', async () => {
        const firestore = new MockFirebaseApp().firestore();
        firestore.mocker.fromMockDatabase(database);

        const result = await firestore
          .collection('list')
          .orderBy('value')
          .startAt(3)
          .get();

        expect(result.size).toBe(3);
        expect(result.docs[0].data()).toEqual({
          name: 'Rasberry',
          value: 3,
        });
      });
    });
  });
});
