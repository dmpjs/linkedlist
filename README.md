<h1 align="center">Linklist</h1>
<p align="center">
    <a href="https://github.com/dmpjs/linkedlist/releases">
        <img src="https://img.shields.io/github/release/dmpjs/linkedlist.svg?color=bright_green&label=latest&style=flat-square">
    </a>
    <a href="https://github.com/dmpjs/linkedlist/actions">
        <img src="https://img.shields.io/github/workflow/status/dmpjs/linkedlist/Continuous%20Integration/master?label=ci&style=flat-square">
    </a>
    <a href="https://github.com/semantic-release/semantic-release">
        <img src="https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?style=flat-square">
    </a>
    <a href="https://opensource.org/licenses/MIT">
        <img src="https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square">
    </a>
</p>

A Deno port of [x3-linkedlist](https://github.com/x3cion/x3-linkedlist)

A doubly linked list (Bi-directional) implementation

### What is a linked list

A linked list is a common data structure made of a chain of nodes in which each node contains a value and a pointer to the next node in the chain.

The head pointer points to the head node, and the tail element of the list points to null. When the list is empty, the head pointer points to null.

## Installation

Run

```
import { LinkedList, LinkedListItem } from "https://raw.githubusercontent.com/dmpjs/linkedlist/v1.1.0/ import from github as raw data

import { LinkedList, LinkedListItem } from "https://deno.land/x/linkedlist@v1.1.0/ If module is uploaded into deno.land
```

## Usage

```
import { LinkedList } from "https://raw.githubusercontent.com/dmpjs/linkedlist/v1.1.0/ import from github as raw data

const list = new LinkedList([1, 2, 3, 4]);

console.log("content:", list.join(" -> "));
```

## Test

Run

```bash
$ deno test test.ts
```
To run all tests.

## Versioning

This library follows semantic versioning, and additions to the code ruleset are performed in major releases.

## Changelog

Please have a look at [`CHANGELOG.md`](CHANGELOG.md).

## Contributing

Please have a look at [`CONTRIBUTING.md`](.github/CONTRIBUTING.md).

## Code of Conduct

Please have a look at [`CODE_OF_CONDUCT.md`](.github/CODE_OF_CONDUCT.md).

## License

This package is licensed using the MIT License.

Please have a look at [`LICENSE.md`](LICENSE.md).
