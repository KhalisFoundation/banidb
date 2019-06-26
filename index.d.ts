export var TYPES : string[];

interface ISources  {
    all: "All Sources",
    G: "Guru Granth Sahib Ji",
    D: "Dasam Granth Sahib",
    B: "Bhai Gurdas Ji Vaaran",
    A: "Amrit Keertan",
    S: "Bhai Gurdas Singh Ji Vaaran",
    N: "Bhai Nand Lal Ji Vaaran",
    R: "Rehatnamas & Panthic Sources"
}

export var SOURCES : ISources;

interface IOptions {
    q: string,
    source: keyof ISources,
    type: number,
    writer: number,
    raag: number,
    ang: number,
    results: number,
    offset: number,
    id: number,
    hukam: number,
    akhar: boolean,
    lipi: boolean,
    random: boolean,
    randomid: boolean,
    API_URL: string
}

export const buildApiUrl : (options: Partial<IOptions>) => string;