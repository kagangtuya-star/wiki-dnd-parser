// 表格的单元格
export type ParagraphCell = {
    type: 'cell';
    roll: { exact?: number; min?: number; max?: number; pad?: boolean };
    entry?: string;
};

// 段落组
export type ParagraphEntries = {
    name?: string;
    ENG_name?: string;
    type: 'entries';
    entries: ParagraphContentTypes[];
    page?: number;
};

// 表格（外框及行列定义）
export type ParagraphTable = {
    type: 'table';
    caption?: string;
    colLabels: string[];
    colStyles: string[];
    rows: (string | number | ParagraphCell)[][];
};

// 缩进
export type ParaghaphInset = {
    type: 'inset';
    name: string;
    page?: number;
    entries: ParagraphContentTypes[];
};

// 列表
export type ParagraphList = {
    type: 'list';
    style?: string;
    items: (string | ParagraphList | ParagraphListItem | ParagraphEntries)[];
};

// 列表项
export type ParagraphListItem = {
    type: 'item';
    name: string;
    entry?: string;
    entries?: ParagraphGroup;
    ENG_name?: string;
};

// 节（意义不明）
export type ParagraphSection = {
    type: 'section';
    name?: string;
    entries: ParagraphGroup;
};

// 引用段落（双引号）
export type ParagraphQuote = {
    type: 'quote';
    entries: ParagraphGroup;
};

// 内容类型
export type ParagraphContentTypes =
    | string
    | ParagraphEntries
    | ParagraphTable
    | ParagraphList
    | ParaghaphInset
    | ParagraphSection
    | ParagraphQuote;

export type ParagraphGroup = ParagraphContentTypes[];
