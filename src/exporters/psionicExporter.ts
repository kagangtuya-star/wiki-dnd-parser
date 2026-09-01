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

export interface PsionicExporterResult {
    count: number;
    data: Record<string, any>[];
}

export const runPsionicExporter = async (
    profiles: ExportProfile[],
    deps: { idMgr: IdMgrLike; logger: LoggerLike }
): Promise<PsionicExporterResult> => {
    const result = await runGenericFileExporter(profiles, deps);
    const profile = profiles.find(p => p.dataType === 'psionic');
    return {
        count: profile ? result.counts[profile.dataType] || 0 : 0,
        data: profile ? result.data[profile.dataType] || [] : [],
    };
};