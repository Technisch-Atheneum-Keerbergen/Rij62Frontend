export enum Language {
    English = "English",
    Dutch = "Dutch"
}

export type MultiLangString = { [key in Language]:string };