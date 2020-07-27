/**
 * Represents an Item within LinkedList.
 *
 * An item holds a value and the links to other LinkedListItem's
 * LinkedListItem's can only be attached behind.
 * There for, to add one before, before has to add one behind.
 */
export class LinkedListItem<T> {
  /**
   * Item behind this item
   * A -> ThisItem -> C
   *                  ^
   */
  public behind: LinkedListItem<T> | undefined;

  /**
   * Item before this item
   * A -> ThisItem -> C
   * ^
   */
  public before: LinkedListItem<T> | undefined;

  /**
   * @param value Value to be held
   * @param unlinkCleanup Function to run on unlink() call. Usually used by LinkedList to fix head and tail pointers and reduce length.
   */
  constructor(
    public value: T,
    /**
     *
     */
    protected unlinkCleanup?: (item: LinkedListItem<T>) => void,
  ) {}

  /**
   * This will link given LinkListItem behind this item.
   * If there's already a LinkedListItem linked behind, it will be relinked accordingly
   * @param item LinkListItem to be inserted behind this one
   */
  public insertBehind(item: LinkedListItem<T>): void {
    item.insertBefore(this);

    if (this.behind) {
      let itemChainEnd = item;
      while (itemChainEnd.behind) itemChainEnd = itemChainEnd.behind;

      this.behind.insertBefore(itemChainEnd);
      itemChainEnd.insertBehind(this.behind);
    }
    this.behind = item;
  }

  /**
   * Unlinks this LinkedListItem and calls unlinkCleanup
   * @param unchain If true, additionally removes the reference to the item before and behind
   * @see LinkedListItem#unlinkCleanup
   */
  public unlink(unchain = false): void {
    if (this.before) this.before.behind = this.behind;

    if (this.behind) {
      this.behind.before = this.before;
    }

    if (this.unlinkCleanup) {
      this.unlinkCleanup(this);
    }

    this.unlinkCleanup = undefined;

    if (unchain) {
      this.before = this.behind = undefined;
    }
  }

  /**
   * Item given will be inserted before this item.
   * unlinkCleanup will be copied if neccessary.
   * This function is protected, because LinkedListItem's can only be attached behind.
   *
   * @param before
   * @see insertBehind
   */
  protected insertBefore(before: LinkedListItem<T>): void {
    this.before = before;

    if (!this.unlinkCleanup) {
      this.unlinkCleanup = before.unlinkCleanup;
    }
  }
}
