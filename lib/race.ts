import type { Operation } from "./types.ts";
import { action, spawn } from "./instructions.ts";

/**
 * Race the given operations against each other and return the value of
 * whichever operation returns first. This has the same purpose as
 * [Promise.race](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/race).
 *
 * If an operation become errored first, then `race` will fail with this error.
 * After the first operation wins the race, all other operations will become
 * halted and therefore cannot throw any further errors.
 *
 * @example
 *
 * ```typescript
 * import { main, race, fetch } from 'effection';
 *
 * await main(function*() {
 *  let fastest = yield* race([fetch('http://google.com'), fetch('http://bing.com')]);
 *  // ...
 * });
 * ```
 *
 * @typeParam T the type of the operations that race against each other
 * @param operations a list of operations to race against each other
 * @returns the value of the fastest operation
 */
export function race<T>(operations: Operation<T>[]): Operation<T> {
  return action<T>(function* (resolve, reject) {
    for (let operation of operations) {
      yield* spawn(function* () {
        try {
          resolve(yield* operation);
        } catch (error) {
          reject(error);
        }
      });
    }
  });
}
