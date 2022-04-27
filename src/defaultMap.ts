export class DefaultMap<K, V> {
  private readonly map = new Map<K, V>();
  constructor(
    private readonly factory: () => V,
  ) { }

  public get(key: K): V {
    const value = this.map.get(key);
    if (value) {
      return value;
    }
    // else
    const newOrg = this.factory();
    this.map.set(key, newOrg);
    return newOrg;
  }

  public remove(key: K): boolean {
    return this.map.delete(key);
  }

  public entries() {
    return this.map.entries();
  }
}
