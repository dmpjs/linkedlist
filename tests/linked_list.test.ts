import { LinkedList, LinkedListItem } from "../mod.ts";
import { assertEquals, assertNotEquals, assertThrows } from "./../test_deps.ts";

const { test } = Deno;

/**
 * Returns a LinkedList, the corresponding LinkedListItem's and an array of every value
 * @param count Amount of entries in returned list, items and values
 * @param offset Added as offset to the number being stringified and used as value
 */
function getListWithItems(
  count: number,
  offset = 0,
): {
  list: LinkedList<string>;
  items: Array<LinkedListItem<string>>;
  values: string[];
} {
  const list = new LinkedList<string>();
  const items = [];
  const values = [];
  for (let i = 0; i < count; i++) {
    const value = (i + offset).toString();
    values.push(value);
    list.push(value);
  }

  items.push(...list.keys());

  return {
    items,
    list,
    values,
  };
}

type GuaranteedNonEmptyLinkedList<T> = LinkedList<T> & {
  head: LinkedListItem<T>;
  tail: LinkedListItem<T>;
};

type NonEmptyGetList = ReturnType<typeof getListWithItems> & {
  list: GuaranteedNonEmptyLinkedList<string>;
};

/**
 * Returns a value at given index position in given LinkedList
 *
 * @param list LinkedList to be traversed
 * @param index Index of entry to be returned
 */
function getValueOnIndex<T>(list: LinkedList<T>, index: number): T {
  let current = list.head;
  while (current && index--) current = current.behind;

  if (!current) {
    throw new Error("Index number yields no entry!");
  }
  return current && current.value;
}

function getCallbackThisArgTest<
  K extends keyof Pick<
    LinkedList<string>,
    "every" | "some" | "filter" | "find" | "findItem" | "forEach" | "map"
  >,
>(
  targetedFunction: K,
): () => void {
  return (): void => {
    const { list } = getListWithItems(1);

    const newThis1 = { testvalue: 1 };
    let callbackBeenCalled1 = false;

    // deno-lint-ignore no-explicit-any
    type Any = any;

    (list[targetedFunction] as (
      cb: (...arg: Any[]) => Any,
      thisArg: Any,
    ) => Any)(function (this: typeof newThis1): void {
      callbackBeenCalled1 = true;

      assertEquals(this, newThis1);

      return;
    }, newThis1);

    assertEquals(callbackBeenCalled1, true);

    const newThis2 = -1;
    let callbackBeenCalled2 = false;

    (list[targetedFunction] as (
      cb: (...arg: Any[]) => Any,
      thisArg: Any,
    ) => Any)(function (this: typeof newThis2): void {
      callbackBeenCalled2 = true;

      assertEquals(this, newThis2);

      return;
    }, newThis2);

    assertEquals(callbackBeenCalled2, true);
  };
}

test('getListWithItems returns valid pairs of list, items and values"', (): void => {
  const consistentLength = 7;
  const { list, items, values: givenValues } = getListWithItems(
    consistentLength,
  );
  const expectedValues = ["0", "1", "2", "3", "4", "5", "6"];

  assertEquals(expectedValues.length, consistentLength);
  assertEquals(items.length, consistentLength);
  assertEquals(givenValues.length, consistentLength);
  assertEquals(list.length, consistentLength);

  assertEquals(
    expectedValues.every((value) => expectedValues.includes(value)),
    true,
  );
  assertEquals(
    items.every((item) => expectedValues.includes(item.value)),
    true,
  );
  assertEquals(list.every((value) => expectedValues.includes(value)), true);
});

test("getValueOnIndex returns the right value for given index", (): void => {
  const { list, values } = getListWithItems(5);

  for (let i = 0; i < values.length; i++) {
    assertEquals(getValueOnIndex(list, i), values[i]);
  }
});

test("creates new LinkedList on call", (): void => {
  const list = new LinkedList<number>();

  assertEquals(true, list instanceof LinkedList);
  assertEquals(list.length, 0);
  assertEquals(list.head, undefined);
  assertEquals(list.tail, undefined);
});

test("creates filled LinkedList if iteratable is given", (): void => {
  const list = new LinkedList([1, 2, false, true]);

  assertEquals(list.length, 4);
  assertEquals([...list.values()], [1, 2, false, true]);
});

test("removes first item", (): void => {
  const { list } = getListWithItems(3);

  list.clear();

  assertEquals(list.head, undefined);
});

test("removes last item", (): void => {
  const { list } = getListWithItems(3);

  list.clear();

  assertEquals(list.tail, undefined);
});

test("resets length", (): void => {
  const { list } = getListWithItems(3);

  list.clear();

  assertEquals(list.length, 0);
});

test("properly unchains if unchain = true", (): void => {
  const { list } = getListWithItems(3);
  const item = list.head?.behind as LinkedListItem<unknown>;

  assertNotEquals(item, undefined);
  assertNotEquals(item.before, undefined);
  assertNotEquals(item.behind, undefined);

  list.clear(true);

  assertEquals(item.before, undefined);
  assertEquals(item.behind, undefined);
});

test("iterates for every element as long as a truthy value is returned", (): void => {
  const { list } = getListWithItems(3);

  let count = 0;

  const fncReturn = list.every(() => !!++count);

  assertEquals(count, 3);
  assertEquals(fncReturn, true);
});

test("breaks on any falsy return", (): void => {
  const { list } = getListWithItems(3);

  let countdown = 2;
  let count = 0;

  const fncReturn = list.every(() => !!++count && !!--countdown);

  assertEquals(count, 2);
  assertEquals(fncReturn, false);
});

test("set callback-this correctly", getCallbackThisArgTest("every"));

test("returns only values for which callback returns truthy", (): void => {
  const { list, items } = getListWithItems(10);
  const allowedItems = new Set(["1", "2", "5", "7"]);

  const filteredList = list.filter((value, item, innerList) => {
    assertEquals(items.includes(item), true);
    assertEquals(innerList, list);

    return allowedItems.has(value);
  });

  const filteredValues = [...filteredList.values()];

  assertEquals(filteredValues.length, allowedItems.size);
  assertEquals(filteredValues.every((value) => allowedItems.has(value)), true);
});

test("returns empty LinkedList if callback never was truthy", (): void => {
  const { list } = getListWithItems(3);
  const filteredList = list.filter(() => false);

  assertEquals(filteredList.length, 0);
});

test("returns empty LinkedList for empty LinkedList", (): void => {
  const { list } = getListWithItems(0);
  const filteredList = list.filter(() => true);

  assertEquals(filteredList.length, 0);
});

test("set callback-this correctly", getCallbackThisArgTest("filter"));

test("finds in LinkedList", (): void => {
  const { list } = getListWithItems(5);
  const found = list.find((value) => value === "3");

  assertEquals(found, "3");
});

test("set callback-this correctly", getCallbackThisArgTest("find"));

test("finds in LinkedList", (): void => {
  const { list, items } = getListWithItems(7);
  const foundItem = list.findItem((value) => value === "6");

  assertEquals(foundItem, items[6]);
});

test("set callback-this correctly", getCallbackThisArgTest("findItem"));

test("runs function for each element", (): void => {
  const { list, values } = getListWithItems(4);

  const forEachResponses = [true, false, {}, 5];
  let forEachRun = 0;

  list.forEach((value) => {
    forEachRun++;

    assertEquals(values.includes(value), true);

    return forEachResponses[forEachRun];
  });

  assertEquals(forEachRun, 4);
});

test("set callback-this correctly", getCallbackThisArgTest("forEach"));

test("returns true on found element", (): void => {
  const { list } = getListWithItems(5);

  assertEquals(list.includes("3"), true);
});

test("returns false if element is not found", (): void => {
  const { list } = getListWithItems(5);

  assertEquals(list.includes("5"), false);
});

test("returns false on empty list", (): void => {
  const { list } = getListWithItems(0);

  assertEquals(list.includes("0"), false);
});

test("returns item for found value", (): void => {
  const { list, items } = getListWithItems(5);
  const item = list.itemOf("4");

  assertEquals(item, items[4]);
});

test("returns first item found", (): void => {
  const { list } = getListWithItems(5);

  list.push("0");

  const item = list.itemOf("0");

  assertEquals(item, list.head);
  assertNotEquals(item, list.tail);
  assertNotEquals(list.head, list.tail);
});

test("returns undefined for not found item or empty list", (): void => {
  const { list: emptyList } = getListWithItems(0);
  const { list } = getListWithItems(2);

  assertEquals(emptyList.itemOf("0"), undefined);
  assertEquals(list.itemOf("2"), undefined);
});

test("returns item for found value", (): void => {
  const { list, items } = getListWithItems(5);
  const item = list.lastItemOf("4");

  assertEquals(item, items[4]);
});

test("returns first item found", (): void => {
  const { list } = getListWithItems(5);

  list.push("0");

  const item = list.lastItemOf("0");

  assertEquals(item, list.tail);
  assertNotEquals(item, list.head);
  assertNotEquals(list.head, list.tail);
});

test("returns undefined for not found item or empty list", (): void => {
  const { list: emptyList } = getListWithItems(0);
  const { list } = getListWithItems(2);

  assertEquals(emptyList.lastItemOf("0"), undefined);
  assertEquals(list.lastItemOf("2"), undefined);
});

test("maps for every item in list", (): void => {
  const { list } = getListWithItems(4);
  const expectedOutput = [1, 2, 3, 4];
  const output = list.map((value) => parseInt(value, 10) + 1);

  assertEquals(output.length, 4);
  assertEquals(output.every((value) => expectedOutput.includes(value)), true);
});

test("passes items and list as second and third argument", (): void => {
  const { list, items } = getListWithItems(5);
  let iterationCount = 0;

  list.map((_, item, listParameter) => {
    iterationCount++;

    assertEquals(items.includes(item), true);
    assertEquals(listParameter, list);
  });

  assertEquals(iterationCount, 5);
});

test("returns empty list for lists and doesn't run callback", (): void => {
  const { list } = getListWithItems(0);
  let callbackRun = false;
  const newList = list.map(() => {
    callbackRun = true;
  });

  assertEquals(newList.length, 0);
  assertEquals(callbackRun, false);
});

test("set callback-this correctly", getCallbackThisArgTest("map"));

test("without given initialValue, uses first value", (): void => {
  const { list } = getListWithItems(3, 5);
  const expectedOutput = "5,6,7";
  const output = list.reduce((acc, value) => {
    return (acc += `,${value}`);
  });

  assertEquals(output, expectedOutput);
});

test("works with given initialValue", (): void => {
  const { list } = getListWithItems(3, 1);
  const finalValue = list.reduce(
    (acc, value) => acc + parseInt(value, 10),
    -100,
  );

  assertEquals(finalValue, -94);
});

test("throws on empty list with empty accumulator", (): void => {
  const list = new LinkedList();

  assertThrows(
    () =>
      list.reduce(() => {
        return;
      }),
    TypeError,
    "Empty accumulator on empty LinkedList is not allowed.",
  );
});

test("with empty LinkedList and initialValue, return initialValue", (): void => {
  const list = new LinkedList<string>();

  let callbackCalled = false;

  const output = list.reduce<string>(() => {
    callbackCalled = true;
    return "newValue";
  }, "initialValue");

  assertEquals(callbackCalled, false);
  assertEquals(output, "initialValue");
});

test("LinkedList with only one entry and no initialValue returns its entry", (): void => {
  const list = new LinkedList([5]);

  let callbackCalled = false;

  const output = list.reduce(() => {
    callbackCalled = true;
  });

  assertEquals(callbackCalled, false);
  assertEquals(output, 5);
});

test("without given initialValue, uses first value", (): void => {
  const { list } = getListWithItems(3, 5);
  const expectedOutput = "7,6,5";
  const output = list.reduceRight((acc, value) => {
    return (acc += `,${value}`);
  });

  assertEquals(output, expectedOutput);
});

test("works with given initialValue", (): void => {
  const { list } = getListWithItems(3, 1);
  const finalValue = list.reduceRight<string[]>((acc, value) => {
    acc.push(value);
    return acc;
  }, []);

  assertEquals(finalValue, ["3", "2", "1"]);
});

test("throws on empty list with empty accumulator", (): void => {
  const list = new LinkedList();

  assertThrows(
    () =>
      list.reduceRight(() => {
        return;
      }),
    TypeError,
    "Empty accumulator on empty LinkedList is not allowed.",
  );
});

test("with empty LinkedList and initialValue, return initialValue", (): void => {
  const list = new LinkedList<string>();

  let callbackCalled = false;

  const output = list.reduceRight<string>(() => {
    callbackCalled = true;
    return "newValue";
  }, "initialValue");

  assertEquals(callbackCalled, false);
  assertEquals(output, "initialValue");
});

test("breaks as soon as a value has been found", (): void => {
  const { list } = getListWithItems(4);

  let iterationCount = 0;

  const returnedValue = list.some((value) => {
    iterationCount++;
    return value === "2";
  });

  assertEquals(iterationCount, 3);
  assertEquals(returnedValue, true);
});

test("doesn't break if no value could be found", (): void => {
  const { list } = getListWithItems(5);
  let iterationCount = 0;

  const returnedValue = list.some((value) => {
    iterationCount++;
    return value === "5";
  });

  assertEquals(iterationCount, 5);
  assertEquals(returnedValue, false);
});

test("always false for empty LinkedList", (): void => {
  const list = new LinkedList<string>();
  let iterationCount = 0;

  const returnedValue = list.some(() => {
    iterationCount++;
    return true;
  });

  assertEquals(iterationCount, 0);
  assertEquals(returnedValue, false);
});

test("set callback-this correctly", getCallbackThisArgTest("some"));

test("joins like array", (): void => {
  const list = new LinkedList([-1, "abc", true]);
  const returnValue1 = list.join();

  assertEquals(returnValue1, "-1,abc,true");

  const returnValue2 = list.join("-");

  assertEquals(returnValue2, "-1-abc-true");
});

test("joins nothing if LinkedList is empty", (): void => {
  const list = new LinkedList();
  const returnValue = list.join("/");

  assertEquals(returnValue, "");
});

test("joins pure LinkedList's together", (): void => {
  const { list: list1 }: NonEmptyGetList = getListWithItems(
    2,
  ) as NonEmptyGetList;
  const { list: list2 } = getListWithItems(2, 10) as NonEmptyGetList;
  const { list: list3, items: items3 } = getListWithItems(
    2,
    20,
  ) as NonEmptyGetList;

  const joinedList1: GuaranteedNonEmptyLinkedList<string> = list1.concat(
    list2,
    list3,
  ) as GuaranteedNonEmptyLinkedList<string>;

  if (!joinedList1.head || !joinedList1.tail) {
    return assertEquals(true, false);
  }

  for (const list of [list1, list2, list3]) {
    for (const value of list.values()) {
      assertEquals(joinedList1.includes(value), true);
    }
  }

  for (const value of joinedList1.values()) {
    assertEquals(
      list1.includes(value) || list2.includes(value) || list3.includes(value),
      true,
    );
  }

  // The first element of the joined list holds the value of the first element of the first list
  assertEquals(joinedList1.head.value, list1.head.value);

  // the last element of the joined list holds the value of the last element of the third list
  assertEquals(
    (joinedList1.tail as LinkedListItem<string>).value,
    (list3.tail as LinkedListItem<string>).value,
  );

  // Includes 11, which is the second element from the second list
  assertEquals(joinedList1.includes("11"), true);

  // Includes value of the first item of the third list
  assertEquals(getValueOnIndex(joinedList1, 4), items3[0].value);

  const joinedList2: GuaranteedNonEmptyLinkedList<string> = list1.concat(list2)
    .concat(list3) as GuaranteedNonEmptyLinkedList<string>;

  let current1: LinkedListItem<string> | undefined = joinedList1.head;
  let current2: LinkedListItem<string> | undefined = joinedList2.head;
  do {
    assertEquals(current1.value, current2.value);
    current1 = current1.behind;
    current2 = current2.behind;
  } while (current1 && current2);

  // Expect both to be undefined
  assertEquals(current1, undefined);
  assertEquals(current2, undefined);
});

test("does not use LinkedListItem's of concat'ed LinkedList's", (): void => {
  const { list: list1, items: items1 } = getListWithItems(2);
  const { list: list2, items: items2 } = getListWithItems(2, 10);

  const joinedList = list1.concat(list2);

  let current = joinedList.head;

  while (current) {
    assertEquals(items1.includes(current), false);
    assertEquals(items2.includes(current), false);

    current = current.behind;
  }
});

test("joins abitrary items together", (): void => {
  const { list: list1, items: items1 } = getListWithItems(2);
  const { list: list2, items: items2 } = getListWithItems(2, 10);
  const stringValue = "abc";
  const objectValue = { a: 1 };
  const arrayValue: null[] = [null];

  const joinedList = list1.concat<string | object | null>(
    stringValue,
    list2,
    objectValue,
    arrayValue,
    list1,
  );

  assertEquals(getValueOnIndex(joinedList, 4), items2[1].value);
  assertEquals(getValueOnIndex(joinedList, 5), objectValue);
  assertEquals(getValueOnIndex(joinedList, 8), items1[1].value);
});

test("returns and removes last element from LinkedList", (): void => {
  const { list, values } = getListWithItems(4);
  const returnedValue = list.pop();

  assertEquals(returnedValue, values[values.length - 1]);
  assertEquals(list.length, 3);
});

test("returns and removes last element from LinkedList", (): void => {
  const { list } = getListWithItems(0);
  const returnedValue = list.pop();

  assertEquals(returnedValue, undefined);
  assertEquals(list.length, 0);
});

test("returns and removes first element from LinkedList", (): void => {
  const { list, values } = getListWithItems(4);
  const returnedValue = list.shift();

  assertEquals(returnedValue, values[0]);
  assertEquals(list.length, 3);
});

test("returns undefined on empty list", (): void => {
  const { list } = getListWithItems(0);
  const returnedValue = list.shift();

  assertEquals(returnedValue, undefined);
  assertEquals(list.length, 0);
});

test("returns undefined on empty list", (): void => {
  const emptyList = new LinkedList();
  assertEquals(emptyList.head, undefined);
  assertEquals(emptyList.tail, undefined);

  emptyList.push("anything");

  assertEquals(emptyList.head, emptyList.tail);
  assertEquals(emptyList.length, 1);
  assertEquals(
    (emptyList as GuaranteedNonEmptyLinkedList<string>).head.value,
    "anything",
  );

  const list = new LinkedList([1, 2, 3]) as GuaranteedNonEmptyLinkedList<
    number
  >;

  list.push(-1);

  assertEquals(list.tail.value, -1);
  assertEquals(list.length, 4);
});

test("adds element to the beginning of the LinkedList", (): void => {
  const emptyList = new LinkedList<string>();

  emptyList.unshift("anything");

  assertEquals(emptyList.head, emptyList.tail);
  assertEquals(emptyList.length, 1);
  assertEquals(
    (emptyList as GuaranteedNonEmptyLinkedList<string>).tail.value,
    "anything",
  );

  const list = new LinkedList([1, 2, 3]) as GuaranteedNonEmptyLinkedList<
    number
  >;

  list.unshift(-1);

  assertEquals(list.head.value, -1);
  assertEquals(list.length, 4);
});

test("removes a value from LinkedList", (): void => {
  const list = new LinkedList([3, 4, 5, 3]);
  const returnedValue = list.remove(3);

  assertEquals(returnedValue, true);
  assertEquals(list.length, 3);
  assertEquals([...list.values()], [4, 5, 3]);
});

test("removes nothing if value could not be found", (): void => {
  const list = new LinkedList([4, 5, 6]);
  const returnedValue = list.remove(7);

  assertEquals(returnedValue, false);
  assertEquals(list.length, 3);
  assertEquals([...list.values()], [4, 5, 6]);
});

test("removes a value from LinkedList", (): void => {
  const list = new LinkedList([3, 4, 5, 3]);
  const returnedValue = list.removeAllOccurrences(3);

  assertEquals(returnedValue, true);
  assertEquals(list.length, 2);
  assertEquals([...list.values()], [4, 5]);
});

test("removes nothing if value could not be found", (): void => {
  const list = new LinkedList([4, 5, 6]);
  const returnedValue = list.removeAllOccurrences(7);

  assertEquals(returnedValue, false);
  assertEquals(list.length, 3);
  assertEquals([...list.values()], [4, 5, 6]);
});

test("returns exactly the content of the list", (): void => {
  const { list, items, values } = getListWithItems(4);
  const iteratorResponse = [...list[Symbol.iterator]()];
  const entriesResponse = [...list.entries()];

  assertEquals(iteratorResponse.length, 4);
  assertEquals(
    iteratorResponse.every(([item, value]) =>
      items.includes(item) && values.includes(value)
    ),
    true,
  );

  assertEquals(entriesResponse.length, 4);
  assertEquals(
    entriesResponse.every(([item, value]) =>
      items.includes(item) && values.includes(value)
    ),
    true,
  );
});

test("returns nothing if list is empty", (): void => {
  const { list } = getListWithItems(0);
  const iteratorResponse = [...list[Symbol.iterator]()];
  const entriesResponse = [...list.entries()];

  assertEquals(iteratorResponse.length, 0);
  assertEquals(entriesResponse.length, 0);
});

test("returns exactly the content of the list", (): void => {
  const { list, items } = getListWithItems(4);
  const keyResponse = [...list.keys()];

  assertEquals(keyResponse.length, 4);
  assertEquals(keyResponse.every((item) => items.includes(item)), true);
});

test("returns nothing if list is empty", (): void => {
  const { list } = getListWithItems(0);
  const keyResponse = [...list.keys()];

  assertEquals(keyResponse.length, 0);
});

test("returns exactly the content of the list", (): void => {
  const { list, values } = getListWithItems(4);
  const valuesResponse = [...list.values()];

  assertEquals(valuesResponse.length, 4);
  assertEquals(valuesResponse.every((value) => values.includes(value)), true);
});

test("returns nothing if list is empty", (): void => {
  const { list } = getListWithItems(0);
  const valuesResponse = [...list.values()];

  assertEquals(valuesResponse.length, 0);
});
