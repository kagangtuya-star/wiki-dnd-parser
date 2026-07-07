import { BaseExporter } from './baseExporter.js';

export interface BackgroundExporterResult {
    count: number;
    data: Record<string, any>[];
}

export const runBackgroundExporter = async (): Promise<BackgroundExporterResult> => {
    const exporter = new BaseExporter({
        dataType: 'background',
        dataFile: 'backgrounds.json',
        dataKey: 'background',
        fluffFile: 'fluff-backgrounds.json',
        fluffKey: 'backgroundFluff',
    });
    
    const result = await exporter.run();
    return { count: result.count, data: result.data };
};
