"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seed = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
async function seed(knex) {
    const regionsUrl = 'https://www.fuzzwork.co.uk/dump/latest/mapRegions.csv';
    const constellationsUrl = 'https://www.fuzzwork.co.uk/dump/latest/mapConstellations.csv';
    const solarSystemsUrl = 'https://www.fuzzwork.co.uk/dump/latest/mapSolarSystems.csv';
    console.log('Downloading regions...');
    const regionsCsv = await (0, node_fetch_1.default)(regionsUrl);
    const regions = new Map((await regionsCsv.text()).split('\n').slice(1).map(line => {
        const [regionId, regionName] = line.split(',', 2);
        return [parseInt(regionId), regionName];
    }));
    console.log('Downloading constellations...');
    const constellationsCsv = await (0, node_fetch_1.default)(constellationsUrl);
    const constellations = new Map((await constellationsCsv.text()).split('\n').slice(1).map(line => {
        const [_, constellationId, constellationName] = line.split(',', 3);
        return [parseInt(constellationId), constellationName];
    }));
    console.log('Downloading solar systems...');
    const solarSystemsCsv = await (0, node_fetch_1.default)(solarSystemsUrl);
    const solarSystems = (await solarSystemsCsv.text()).split('\n').slice(1).map(line => {
        const [regionId, constellationId, _, solarSystemName] = line.split(',', 4);
        return {
            name: solarSystemName,
            constellation: constellations.get(parseInt(constellationId)) ?? null,
            region: regions.get(parseInt(regionId)) ?? null,
        };
    }).filter((s) => !!s.constellation && !!s.region);
    await knex('systems')
        .insert(solarSystems)
        .onConflict('name').merge();
    console.log('Done');
}
exports.seed = seed;
//# sourceMappingURL=solar-systems.js.map