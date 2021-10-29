export interface LocalStorageOption {
  noPrefix?: boolean;
  noDupeMember?: boolean;
}

export class LocalStorage {
  private _prefix = "";
  private _options: LocalStorageOption = {};

  public get prefix(): string {
    return this._prefix;
  }
  public set prefix(value: string) {
    this._prefix = value;
  }

  public get options(): LocalStorageOption {
    return this._options;
  }
  public set options(value: LocalStorageOption) {
    this._options = value;
  }

  public get keys(): string[] {
    const keyList: string[] = [];
    const allKeys = Object.keys(localStorage);

    if (this.prefix === "") {
      return allKeys;
    }

    allKeys.forEach((key) => {
      if (key.indexOf(this.prefix) >= 0) {
        keyList.push(key.replace(this.prefix, ""));
      }
    });

    return keyList;
  }

  private storagify(values: unknown): string {
    return JSON.stringify({ data: values });
  }

  private getKey(key: string): string {
    if (this.options.noPrefix) return key;
    return this.prefix + key;
  }

  public getItem(
    key: string,
    defaultValue: unknown = undefined
  ): unknown | undefined {
    const queryKey = this.getKey(key);
    const rawValue = localStorage.getItem(queryKey);
    let value;

    // If key doesn't exist, return defaultValue
    if (rawValue === null) {
      return defaultValue;
    }

    try {
      value = JSON.parse(rawValue);
      // If correct format { 'data': data}
      if (value && value.data) {
        return value.data;
      }
      return value;
    } catch (e) {
      console.error(e);
      console.warn(`Got an error when parsing "${rawValue}"`);
      return defaultValue;
    }
  }

  public setItem(key: string, value: unknown): void {
    const queryKey = this.getKey(key);

    try {
      localStorage.setItem(queryKey, this.storagify(value));
    } catch (e) {
      console.error(e);
      console.warn(`LocalStorage can't store '{"${key}": "${value}"}`);
    }
  }

  public getList(key: string): unknown[] {
    const data = this.getItem(key, undefined);
    if (data && Array.isArray(data)) return data;
    return [];
  }

  public removeItem(key: string): boolean {
    const queryKey = this.getKey(key);
    try {
      localStorage.removeItem(queryKey);
      return true;
    } catch (e) {
      console.log(e);
      console.warn(`Can't remove ${key}`);
      return false;
    }
  }

  public getAll(includeKeys: boolean): unknown[] {
    const keys = this.keys;

    if (includeKeys) {
      return keys.reduce((accum: unknown[], key) => {
        const tempObj: { [key: string]: unknown } = {};
        tempObj[key] = this.get(key);
        accum.push(tempObj);
        return accum;
      }, []);
    }

    return keys.map((key) => {
      return this.get(key);
    });
  }

  public isMember(key: string, value: unknown): boolean {
    return this.getList(key).indexOf(value) > -1;
  }

  public addMember(key: string, value: unknown): boolean {
    const queryKey = this.getKey(key);
    const data = this.getList(key);
    if (!this.options.noDupeMember && data.indexOf(value) > -1) {
      console.warn(`The ${value} exists on ${data}`);
      return false;
    }
    try {
      data.push(value);
      localStorage.setItem(queryKey, this.storagify(data));
      return true;
    } catch (e) {
      console.error(e);
      console.warn(`Can't append ${value} to ${data}`);
      return false;
    }
  }

  public removeMember(key: string, value: unknown): unknown {
    const queryKey = this.getKey(key);
    const values = this.getList(key);
    const index = values.indexOf(value);
    let removedItem;

    try {
      if (index > -1) {
        removedItem = values.splice(index, 1);
      }
      localStorage.setItem(queryKey, this.storagify(values));
      return removedItem;
    } catch (e) {
      console.error(e);
      console.warn(`Can't remove "${value}" from the set ${key}`);
      return undefined;
    }
  }

  public flush(): void {
    if (this.prefix.length > 0) {
      this.keys.forEach((key) => {
        this.removeItem(key);
      });
    } else {
      localStorage.clear();
    }
  }

  // alias
  public get(
    key: string,
    defaultValue: unknown = undefined
  ): unknown | undefined {
    return this.getItem(key, defaultValue);
  }

  public set(key: string, value: unknown): void {
    this.setItem(key, value);
  }

  public rm(key: string): boolean {
    return this.removeItem(key);
  }

  public sadd(key: string, value: unknown): boolean {
    return this.addMember(key, value);
  }

  public smembers(key: string): unknown[] {
    return this.getList(key);
  }

  public sismember(key: string, value: unknown): boolean {
    return this.isMember(key, value);
  }

  public srem(key: string, value: unknown): unknown {
    return this.removeMember(key, value);
  }
}
