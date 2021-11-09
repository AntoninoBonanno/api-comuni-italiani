export default interface IIstatFile {
    filePath: string,
    databaseName: string
}

export interface IIstatDatabase extends IIstatFile {
    rows: Array<{ [x in Header]: string }>
}

const header = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G',
    'H', 'I', 'J', 'K', 'L', 'M', 'N',
    'O', 'P', 'Q', 'R', 'S', 'T', 'U',
    'V', 'W', 'X', 'Y', 'Z'
] as const;
type Header = typeof header[number];
