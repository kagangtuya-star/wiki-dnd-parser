import { WikiData } from './wiki';

export type BookIds =
    | 'PHB' // 玩家手册
    | 'MM' // 怪物手册
    | 'DMG' // 城主手册
    | 'Screen'
    | 'SCAG'
    | 'AL'
    | 'VGM'
    | 'XGE'
    | 'MTF'
    | 'GGR'
    | 'SAC'
    | 'AI'
    | 'ERLW'
    | 'RMR'
    | 'EGW'
    | 'MOT'
    | 'ICE'
    | 'ScreenWildernessKit'
    | 'VRGR';

export type BookFileEntry = {
    name: string;
    ENG_name?: string;
    alias?: string[];
    id: string;
    source: string;
    group: string;
    cover: {
        type: string;
        path: string;
    };
    published: string;
    author: string;
    contents: BookContents[];
};

// 书籍目录
export type BookContents = {
    name: string;
    headers?: (string | { index?: number; header: string; depth?: number })[];
    ordinal?: {
        type: string;
        identifier?: string | number;
    };
};

export type BookFile = {
    book: BookFileEntry[];
};

export type BookHeader = {
    name: string;
    subHeaders?: BookHeader[];
};

export type WikiBookEntry = {
    name: string;

    headers: BookHeader[];
};

export type WikiBookData = WikiData<WikiBookEntry, 'book'> & {
    group: string;
    published: string;
};
