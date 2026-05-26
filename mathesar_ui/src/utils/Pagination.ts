const DEFAULT_PAGE_SIZE = 500;
export const UNLIMITED_PAGE_SIZE = 0;

/**
 * [page, size]
 */
export type TersePagination = [number, number];

export default class Pagination {
  /** The first page is page 1 */
  readonly page: number;

  /** The number of records to display */
  readonly size: number;

  readonly offset: number;

  readonly leftBound: number;

  readonly rightBound: number;

  constructor({ page, size }: { page?: number; size?: number } = {}) {
    const resolvedSize = size ?? DEFAULT_PAGE_SIZE;
    this.page = resolvedSize === UNLIMITED_PAGE_SIZE ? 1 : page ?? 1;
    this.size = resolvedSize;
    this.offset =
      this.size === UNLIMITED_PAGE_SIZE ? 0 : (this.page - 1) * this.size;
    this.leftBound = this.offset + 1;
    this.rightBound =
      this.size === UNLIMITED_PAGE_SIZE
        ? Number.POSITIVE_INFINITY
        : this.offset + this.size;
  }

  recordsRequestParams(): { limit: number; offset: number } {
    return {
      limit: this.size === UNLIMITED_PAGE_SIZE ? DEFAULT_PAGE_SIZE : this.size,
      offset: this.offset,
    };
  }

  recordsRequestParamsAllowingUnlimited(): {
    limit?: number | null;
    offset?: number | null;
  } {
    return this.size === UNLIMITED_PAGE_SIZE
      ? { limit: null, offset: null }
      : {
          limit: this.size,
          offset: this.offset,
        };
  }

  terse(): TersePagination {
    return [this.page, this.size];
  }

  static fromTerse(terse: TersePagination): Pagination {
    return new Pagination({
      page: terse[0],
      size: terse[1],
    });
  }

  getMaxPage(recordCount: number): number {
    if (this.size === UNLIMITED_PAGE_SIZE) return 1;
    return Math.ceil(recordCount / this.size);
  }
}

export function sortPageSizeOptions(options: Iterable<number>): number[] {
  return [...options].sort((a, b) => {
    if (a === UNLIMITED_PAGE_SIZE) return 1;
    if (b === UNLIMITED_PAGE_SIZE) return -1;
    return a - b;
  });
}
