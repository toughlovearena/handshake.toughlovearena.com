export class DefaultMap<K, V> {
  private readonly map = new Map<K, V>();

  public get(key: K, factory: () => V): V {
    const value = this.map.get(key);
    if (value) {
      return value;
    }
    // else
    const newOrg = factory();
    this.map.set(key, newOrg);
    return newOrg;
  }

  public remove(key: K): boolean {
    return this.map.delete(key);
  }
  public values() {
    return this.map.values();
  }
  public entries() {
    return this.map.entries();
  }
}
