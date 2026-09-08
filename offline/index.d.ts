export interface SQLiteAdapter {
  query<T = Record<string, unknown>>(sql: string, parameters?: unknown[]): Promise<T[]> | T[];
}

export interface FetchResponse {
  ok: boolean;
  status: number;
  text(): Promise<string>;
}

export type Fetcher = (url: string) => Promise<FetchResponse>;

export interface Verse {
  verseId: number;
  shabadId: number;
  verse: { gurmukhi: string; unicode: string };
  larivaar: { gurmukhi: string; unicode: string };
  translation: {
    en: Record<string, string>;
    pu: Record<string, { gurmukhi?: string; unicode?: string }>;
    es: Record<string, string>;
    hi: Record<string, string>;
  };
  transliteration: Partial<Record<'english' | 'hindi' | 'en' | 'hi' | 'ipa' | 'ur', string>>;
  pageNo: number;
  lineNo: number;
  updated: string;
  visraam: Record<string, Array<{ p: number | string; t?: string }>>;
  writer: null | {
    writerId: number;
    gurmukhi: string | null;
    unicode: string | null;
    english: string | null;
  };
  raag: null | {
    raagId: number;
    gurmukhi: string | null;
    unicode: string | null;
    english: string | null;
    raagWithPage: string | null;
  };
}

export interface Ang {
  source: {
    sourceId: string;
    gurmukhi: string;
    unicode: string;
    english: string;
    pageNo: number;
  };
  count: number;
  navigation: { previous: number | null; next: number | null };
  page: Verse[];
}

export interface BaniDB {
  /** null means the requested source/page is not available in this snapshot. */
  getAng(angNumber: number, sourceId?: string): Promise<Ang | null>;
  /** Explicit network request; never invoked automatically by getAng. */
  checkForUpdate(localMd5: string, md5Url: string): Promise<boolean>;
}

export function createBaniDB(options: { db: SQLiteAdapter; fetch?: Fetcher }): BaniDB;
export function checkForUpdate(localMd5: string, md5Url: string, fetcher?: Fetcher): Promise<boolean>;
