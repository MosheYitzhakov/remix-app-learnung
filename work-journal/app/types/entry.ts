export interface IEntry {
    id: number;
    date: string;
    type: typeEntry;
    text: string;
}
export enum typeEntry {
    work = "work",
    learning = "learning",
    interestingThing = "interesting-thing"
}
