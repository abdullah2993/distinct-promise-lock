class DistinctLock {
  constructor() {
    this._journal = new Map();
  }

  /**
   * Locks an id
   *
   * @param {*} id
   * @returns {Promise<void>}
   * @memberof DistinctLock
   */
  lock(id) {
    const waiter = DistinctLock.externallyResolvablePromise();

    if (this._journal.has(id)) {
      const row = this._journal.get(id);
      const prevWaiter = row[row.length - 1];
      row.push(waiter);
      return prevWaiter.promise;
    } else {
      this._journal.set(id, [waiter]);
      return Promise.resolve();
    }
  }

  /**
   * Unlocks an id
   *
   * @param {*} id
   * @memberof DistinctLock
   */
  unlock(id) {
    if (this._journal.has(id)) {
      const row = this._journal.get(id);
      const firstWaiter = row.shift();
      firstWaiter.resolver();
      if (!row.length) {
        this._journal.delete(id);
      }
    }
  }

  /**
   * Gets a new externally resolvable promise
   *
   * @static
   * @returns {{promise: Promise<any>, resolver: ()=>void}}
   * @memberof DistinctLock
   */
  static externallyResolvablePromise() {
    let resolver;
    // eslint-disable-next-line no-unused-vars
    const promise = new Promise((resolve, reject) => {
      resolver = resolve;
    });
    return { promise: promise, resolver: resolver };
  }
}

module.exports = DistinctLock;
