import { firestore } from "firebase-admin";

export type MessageProps = {
    topic: string;
    body: string;
    title: string;
    sound?: string;
    priority?: "high" | "normal";
};

export interface IToDo {
    date: ITimestamp;
    descripsion: string;
    isDone: boolean;
    title: string;
    userId: string;
}

// export interface IPemberitahuan {
//     dateUpload: ITimestamp
//     idKamar: DocumentReference
//     deskripsi: string
//     tglJatuhTempo: ITimestamp
//     isView: boolean
// }


export type ITimestamp = firestore.Timestamp
export const TimestampNow = firestore.Timestamp.now()
export type DocumentReference = firestore.DocumentReference

