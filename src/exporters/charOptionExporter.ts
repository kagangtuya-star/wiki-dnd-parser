import { runGenericFileExporter } from './genericFileExporter.js';
import type { ExportProfile } from './profileTypes.js';

type LoggerLike = {
    log: (source: string, message: string) => void;
};

type IdMgrLike = {
    compare: <T>(
        dataType: string,
        data: { en: T[]; zh: T[] },
        fn: {
            getId: (item?: T | null) => string;
            getZhTitle: (item: T) => string | null;
            getEnTitle: (item: T) => string | null;
        }
    ) => void;
};

export interface CharOptionExporterResult {
    count: number;
    data: Record<string, any>[];
}

export const runCharOptionExporter = async (
    profiles: ExportProfile[],
    deps: { idMgr: IdMgrLike; logger: LoggerLike }
): Promise<CharOptionExporterResult> => {
    const result = await runGenericFileExporter(profiles, deps);
    const charOptionProfile = profiles.find(p => p.dataType === 'charoption');
    return {
        count: charOptionProfile ? result.counts[charOptionProfile.dataType] || 0 : 0,
        data: charOptionProfile ? result.data[charOptionProfile.dataType] || [] : [],
    };
};