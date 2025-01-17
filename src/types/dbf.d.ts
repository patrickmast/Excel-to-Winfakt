declare module 'shapefile/dbf' {
  interface DBFReader {
    [Symbol.asyncIterator](): AsyncIterator<Record<string, any>>;
  }

  export function read(
    dbfData: ArrayBuffer,
    memoData?: ArrayBuffer
  ): Promise<DBFReader>;
}