import { LinkedListItem } from "../mod.ts";
import { assertEquals } from "./../test_deps.ts";

type GuranteedBehindLinkedListItem<T> = LinkedListItem<T> & {
  behind: GuranteedBehindLinkedListItem<number>;
};

const { test } = Deno;

test("holds given value", (): void => {
  const item = new LinkedListItem("value");

  assertEquals(item.value, "value");
});

test("calls given unlinkCleanup function if given", (): void => {
  let called = false;
  const item = new LinkedListItem(1, (): void => {
    called = true;
  });

  assertEquals(called, false);

  item.unlink();

  assertEquals(called, true);
});

test("inserts given LinkedListItem behind this", (): void => {
  const itemBefore = new LinkedListItem(0);
  const baseItem = new LinkedListItem(1) as GuranteedBehindLinkedListItem<
    number
  >;

  itemBefore.insertBehind(baseItem);

  assertEquals(itemBefore.behind, baseItem);
  assertEquals(baseItem.before, itemBefore);

  const itemBehind = new LinkedListItem(2);
  baseItem.insertBehind(itemBehind);

  assertEquals(baseItem.behind, itemBehind);

  const newItemBehind = new LinkedListItem(1.5);
  baseItem.insertBehind(newItemBehind);

  assertEquals(baseItem.behind, newItemBehind);
  assertEquals(baseItem.behind.behind, itemBehind);
});

test("Adds multiple in a row", (): void => {
  const item1 = new LinkedListItem(1) as GuranteedBehindLinkedListItem<number>;
  const item2 = new LinkedListItem(2);
  const item3 = new LinkedListItem(3);
  const item21 = new LinkedListItem(4);
  const item22 = new LinkedListItem(5);
  const item23 = new LinkedListItem(6);

  item1.insertBehind(item2);
  item2.insertBehind(item3);

  item21.insertBehind(item22);
  item22.insertBehind(item23);

  item2.insertBehind(item21);

  const expectedResult = [1, 2, 4, 5, 6, 3];
  const result = [];

  let current = item1;

  do {
    result.push(current.value);
    current = current.behind;
  } while (current);

  assertEquals(result, expectedResult);
});

test("unlinks this item from chain, but doesn't remove the chain info from item", (): void => {
  const item1 = new LinkedListItem(1);
  const item2 = new LinkedListItem(2);
  const item3 = new LinkedListItem(3);

  item1.insertBehind(item2);
  item2.insertBehind(item3);

  item2.unlink();

  assertEquals(item1.behind, item3);
  assertEquals(item3.before, item1);

  assertEquals(item2.before, item1);
  assertEquals(item2.behind, item3);
});

test("runs given unlinkCleanup function", (): void => {
  let called = false;
  const item = new LinkedListItem(1, (): void => {
    called = true;
  });

  assertEquals(called, false);

  item.unlink();

  assertEquals(called, true);
});
