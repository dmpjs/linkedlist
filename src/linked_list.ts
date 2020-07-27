/**
 * @typeparam T Type of values within this LinkedList
 */
import { LinkedListItem } from "./linked_list_item.ts";

export class LinkedList<T> {
  /**
   * First item in list
   */
  public head: LinkedListItem<T> | undefined;

  /**
   * Last item in list
   */
  public tail: LinkedListItem<T> | undefined;

  /**
   * Current length of this LinkedList.
   * Note that this does not work anymore if you for some reason add your own LinkedListItems to LinkedList by hand
   */
  public length = 0;

  /**
   * @param values Values to be added upfront into list
   */
  constructor(values?: Iterable<T> | LinkedList<T>) {
    if (values) {
      if (values instanceof LinkedList) values = values.values();

      for (const value of values) {
        this.push(value);
      }
    }
  }

  /**
   * Clears this LinkedList.
   * The default complexity is O(1), because it only removes links to the head and tail item and resets the length.
   * Note that if any LinkedListItem is still referenced outside the LinkedList, their before and behind fields might
   * still reference the chain, not freeing space.
   * You can set the unchain parameter to true, so every item in the linked list will be unchained,
   * meaning all references to before and behind items will be removed.
   * This increases complexity to O(n), but removes accidental outside references to the full chain.
   *
   * @param unchain If `true`, remove link info from every item. Changes complexity to O(n)!
   */
  public clear(unchain = false): void {
    if (unchain) {
      while (this.head) {
        this.head.unlink(true);
      }
    }

    this.head = this.tail = undefined;
    this.length = 0;
  }

  /**
   * As Array#every() given callback is called for every element until one call returns falsy or all elements had been processed
   *
   * @returns `false` if there was a falsy response from the callback, `true` if all elements have been processed "falselesly"
   *
   * @see Array#every
   */
  public every<C>(
    callback: (value: T, item: LinkedListItem<T>, list: this) => boolean,
    thisArg?: C,
  ): boolean {
    if (thisArg) {
      callback = callback.bind(thisArg);
    }

    for (const item of this.keys()) {
      if (!callback(item.value, item, this)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Filters values into a new LinkedList
   *
   * @param callback decides whether given element should be part of new LinkedList
   *
   * @see Array#filter
   */
  public filter<C>(
    callback: (value: T, item: LinkedListItem<T>, list: this) => boolean,
    thisArg?: C,
  ): LinkedList<T> {
    if (thisArg) {
      callback = callback.bind(thisArg);
    }

    const newList: LinkedList<T> = new LinkedList();

    for (const [item, value] of this) {
      if (callback(value, item, this)) {
        newList.push(value);
      }
    }

    return newList;
  }

  /**
   * Returns value for which given callback returns truthy
   *
   * @param callback runs for every value in LinkedList. If it returns truthy, current value is returned.
   *
   * @see Array#find
   */
  public find<C>(
    callback: (value: T, item: LinkedListItem<T>, list: this) => boolean,
    thisArg?: C,
  ): T | undefined {
    if (thisArg) {
      callback = callback.bind(thisArg);
    }

    for (const [item, value] of this) {
      if (callback(value, item, this)) {
        return value;
      }
    }
  }

  /**
   * Returns the LinkedListItem for which given callback returns truthy
   *
   * @param callback runs for every LinkedListItem in LinkedList. If it returns truthy, current LinkedListItem is returned.
   *
   * @see Array#findIndex
   */
  public findItem<C>(
    callback: (value: T, item: LinkedListItem<T>, list: this) => boolean,
    thisArg?: C,
  ): LinkedListItem<T> | undefined {
    if (thisArg) {
      callback = callback.bind(thisArg);
    }

    for (const [item, value] of this) {
      if (callback(value, item, this)) {
        return item;
      }
    }
  }

  /**
   * Iterates this LinkedList's items and values
   *
   * @param callback Gets every value in LinkedList once with corresponding LinkedListItem and LinkedList
   * @param thisArg If given, callback will be bound here
   *
   * @see Array#forEach
   */
  public forEach<C>(
    callback: (value: T, item: LinkedListItem<T>, list: this) => void,
    thisArg?: C,
  ): void {
    if (thisArg) {
      callback = callback.bind(thisArg);
    }

    for (const [item, value] of this) {
      callback(value, item, this);
    }
  }

  /**
   * Checks if value can be found within LinkedList, starting from fromIndex, if given.
   *
   * @param value value to be found in this
   * @param fromIndex Starting index. Supports negative values for which `this.size - 1 + fromIndex` will be used as starting point.
   *
   * @returns true if value could be found in LinkedList (respecting fromIndex), false otherwhise
   *
   * @see Array#includes
   */
  public includes(value: T, fromIndex = 0): boolean {
    let current = this.getItemByIndex(fromIndex);

    while (current) {
      if (current.value === value) {
        return true;
      }

      current = current.behind;
    }

    return false;
  }

  /**
   * Searches forward for given value and returns the head corresponding LinkedListItem found
   *
   * @param searchedValue Value to be found
   * @param fromIndex Index to start from
   *
   * @see Array#indexOf
   */
  public itemOf(
    searchedValue: T,
    fromIndex = 0,
  ): LinkedListItem<T> | undefined {
    let current = this.getItemByIndex(fromIndex);

    while (current) {
      if (current.value === searchedValue) {
        return current;
      }

      current = current.behind;
    }

    return;
  }

  /**
   * Searches backwards for given value and returns the head corresponding LinkedListItem found
   *
   * @param searchedValue Value to be found
   * @param fromIndex Index to start from
   *
   * @see Array#indexOf
   */
  public lastItemOf(
    searchedValue: T,
    fromIndex = -1,
  ): LinkedListItem<T> | undefined {
    let current = this.getItemByIndex(fromIndex);

    while (current) {
      if (current.value === searchedValue) {
        return current;
      }
      current = current.before;
    }

    return;
  }

  /**
   * Creates a new LinkedList with each of its itesm representing the output of the callback with each item in current LinkedList.
   *
   * @param callback Gets value, LinkedListeItem and LinkedList. The response will be used as value in the new LinkedList
   * @param thisArg If given, callback is bound to thisArg
   *
   * @see Array#map
   */
  public map<V, C>(
    callback: (value: T, item: LinkedListItem<T>, list: this) => V,
    thisArg?: C,
  ): LinkedList<V> {
    if (thisArg) {
      callback = callback.bind(thisArg);
    }
    const newList = new LinkedList<V>();

    for (const [item, value] of this) {
      newList.push(callback(value, item, this));
    }

    return newList;
  }

  /**
   * From Array#reduce on MDN: The reduce() method executes a reducer function (that you provide) on each element of the LinkedList,
   * resulting in a single output value.
   *
   * @param callback Gets accumulator, value, LinkedListeItem and LinkedList. The response will be used as the next accumulator
   * @param initialValue
   *
   * @see Array#reduce
   */
  public reduce<V>(
    callback: (
      accumulator: T,
      currentValue: T,
      currentItem: LinkedListItem<T>,
      list: this,
    ) => V,
  ): V;
  public reduce<V>(
    callback: (
      accumulator: V,
      currentValue: T,
      currentItem: LinkedListItem<T>,
      list: this,
    ) => V,
    initialValue: V,
  ): V;
  public reduce<V>(
    callback: (
      accumulator: V | T,
      currentValue: T,
      currentItem: LinkedListItem<T>,
      list: this,
    ) => V,
    initialValue?: V | T,
  ): V | T {
    let current = this.head;
    if (!current) {
      if (!initialValue) {
        throw new TypeError(
          "Empty accumulator on empty LinkedList is not allowed.",
        );
      }

      return initialValue;
    }

    if (initialValue === undefined) {
      initialValue = current.value;

      if (!current.behind) {
        return initialValue;
      }

      current = current.behind;
    }

    do {
      initialValue = callback(initialValue, current.value, current, this);
      current = current.behind;
    } while (current);

    return initialValue;
  }

  /**
   * From Array#reduce on MDN: The reduceRight() method applies a function against an accumulator and each value of the LinkedList (from tail-to-head)
   * to reduce it to a single value.
   *
   * @param callback Gets accumulator, value, LinkedListeItem and LinkedList. The response will be used as the next accumulator
   * @param initialValue Initial accumulator being passed to head call
   */
  public reduceRight<V>(
    callback: (
      accumulator: T,
      currentValue: T,
      currentItem: LinkedListItem<T>,
      list: this,
    ) => V,
  ): V;
  public reduceRight<V>(
    callback: (
      accumulator: V,
      currentValue: T,
      currentItem: LinkedListItem<T>,
      list: this,
    ) => V,
    initialValue: V,
  ): V;
  public reduceRight<V>(
    callback: (
      accumulator: V | T,
      currentValue: T,
      currentItem: LinkedListItem<T>,
      list: this,
    ) => V,
    initialValue?: V | T,
  ): V | T {
    let current = this.tail;

    if (!current) {
      if (!initialValue) {
        throw new TypeError(
          "Empty accumulator on empty LinkedList is not allowed.",
        );
      }

      return initialValue;
    }
    // let accumulator: V | T;
    if (initialValue === undefined) {
      initialValue = current.value;

      if (!current.before) {
        return initialValue;
      }
      current = current.before;
    }

    do {
      initialValue = callback(initialValue, current.value, current, this);
      current = current.before;
    } while (current);

    return initialValue;
  }

  /**
   * Runs callback for every entry and returns true immediately if call of callback returns truthy.
   *
   * @param callback called for every element. If response is truthy, iteration
   * @param thisArg If set, callback is bound to this
   *
   * @returns `true` once a callback call returns truthy, `false` if none returned truthy.
   */
  public some<C>(
    callback: (currentValue: T, item: LinkedListItem<T>, list: this) => boolean,
    thisArg?: C,
  ): boolean {
    if (thisArg) {
      callback = callback.bind(thisArg);
    }

    for (const [item, value] of this) {
      if (callback(value, item, this)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Joins values within this by given separator. Uses Array#join directly.
   *
   * @param separator separator to be used
   *
   * @see Array#join
   */
  public join(separator?: string): string {
    return [...this.values()].join(separator);
  }

  /**
   * Concats given values and returns a new LinkedList with all given values.
   * If LinkedList's are given, they will be spread.
   *
   * @param others Other values or lists to be concat'ed together
   *
   * @see Array#concat
   */
  public concat<V>(...others: Array<V | LinkedList<V>>): LinkedList<V | T> {
    const newList = new LinkedList<V | T>(this as LinkedList<V | T>);

    for (const other of others) {
      if (other instanceof LinkedList) {
        newList.push(...other.values());
      } else {
        newList.push(other);
      }
    }

    return newList;
  }

  /**
   * Removes the tail LinkedListItem and returns its inner value
   */
  public pop(): T | undefined {
    if (!this.tail) {
      return;
    }

    const item = this.tail;

    item.unlink();

    return item.value;
  }

  /**
   * Adds given values on the end of this LinkedList
   *
   * @param values Values to be added
   */
  public push(...values: T[]): number {
    for (const value of values) {
      const item = new LinkedListItem(value, this.unlinkCleanup);

      if (!this.head || !this.tail) {
        this.head = this.tail = item;
      } else {
        this.tail.insertBehind(item);
        this.tail = item;
      }

      this.length++;
    }

    return this.length;
  }

  /**
   * Adds given values to the beginning of this LinkedList
   *
   * @param values Values to be added
   */
  public unshift(...values: T[]): number {
    for (const value of values) {
      const item = new LinkedListItem(value, this.unlinkCleanup);

      if (!this.tail || !this.head) {
        this.head = this.tail = item;
      } else {
        item.insertBehind(this.head);
        this.head = item;
      }

      this.length++;
    }

    return this.length;
  }

  /**
   * Removes head occurrence of value found.
   *
   * @param value value to remove from LinkedList
   */
  public remove(value: T): boolean {
    for (const item of this.keys()) {
      if (item.value === value) {
        item.unlink();
        return true;
      }
    }

    return false;
  }

  /**
   * Removes every occurrance of value within this.
   *
   * @param value value to remove from LinkedList
   */
  public removeAllOccurrences(value: T): boolean {
    let foundSomethingToDelete = false;

    for (const item of this.keys()) {
      if (item.value === value) {
        item.unlink();
        foundSomethingToDelete = true;
      }
    }

    return foundSomethingToDelete;
  }

  /**
   * Returns and removes head element from LinkedList
   */
  public shift(): T | undefined {
    if (!this.head) {
      return;
    }

    const item = this.head;

    item.unlink();

    return item.value;
  }

  /**
   * Returns LinkedListItem and value for every entry of this LinkedList
   */
  public *[Symbol.iterator](): IterableIterator<[LinkedListItem<T>, T]> {
    let current = this.head;

    if (!current) {
      return;
    }

    do {
      yield [current, current.value];
      current = current.behind;
    } while (current);
  }

  /**
   * Returns LinkedListItem and value for every entry of this LinkedList
   *
   * @see LinkedList#Symbol.iterator
   */
  public entries(): IterableIterator<[LinkedListItem<T>, T]> {
    return this[Symbol.iterator]();
  }

  /**
   * Iterates the LinkedListItem's of this LinkedList
   */
  public *keys(): IterableIterator<LinkedListItem<T>> {
    let current = this.head;

    if (!current) {
      return;
    }

    do {
      yield current;
      current = current.behind;
    } while (current);
  }

  /**
   * Returns a value for every entry of this LinkedList
   */
  public *values(): IterableIterator<T> {
    let current = this.head;

    if (!current) {
      return;
    }

    do {
      yield current.value;
      current = current.behind;
    } while (current);
  }

  /**
   * Returns the item by given index.
   * Supports negative values and will return the item at `LinkedList.size - 1 + index` in that case.
   *
   * @param index Index of item to get from list
   */
  private getItemByIndex(index: number): LinkedListItem<T> | undefined {
    if (!this.head) {
      return;
    }

    let current: LinkedListItem<T> | undefined;

    if (index > 0) {
      current = this.head;

      while (current && index--) {
        current = current.behind;
      }
    } else if (index < 0) {
      current = this.tail;

      while (current && ++index) {
        current = current.before;
      }
    } else {
      return this.head;
    }

    return current;
  }

  /**
   * Given to own LinkedListItem's for following jobs regarding an unlink:
   * - If item is head item, set the next item as head item
   * - If item is tail item, set the previous item as tail item
   * - Decrease length
   *
   * @param item Item that has been unlinked
   */
  private unlinkCleanup = (item: LinkedListItem<T>): void => {
    if (this.head === item) {
      this.head = this.head.behind;
    }

    if (this.tail === item) {
      this.tail = this.tail.before;
    }

    this.length--;
  };
}
