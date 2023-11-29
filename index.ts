import admin from "firebase-admin";
import * as serviceAccount from "./to_do.json";
import { message } from "./data";
import { MessageProps, TimestampNow, IToDo } from "./types";

const params = {
  type: serviceAccount.type,
  projectId: serviceAccount.project_id,
  privateKeyId: serviceAccount.private_key_id,
  privateKey: serviceAccount.private_key,
  clientEmail: serviceAccount.client_email,
  clientId: serviceAccount.client_id,
  authUri: serviceAccount.auth_uri,
  tokenUri: serviceAccount.token_uri,
  authProviderX509CertUrl: serviceAccount.auth_provider_x509_cert_url,
  clientC509CertUrl: serviceAccount.client_x509_cert_url,
};

const app = admin.initializeApp({
  credential: admin.credential.cert(params),
});

const firestore = admin.firestore(app);
const messaging = admin.messaging(app);

async function sendNotification(props: MessageProps) {
  try {
    const data = message(props);
    const response = await messaging.send({
      topic: data.topic,
      notification: data.notification,
      android: {
        priority: "high",
      },
    });

    console.log("Notification sent successfully:", response);
    console.log("topic:", data.topic);
  } catch (error) {
    console.error("Error sending notification:", error);
  }
}

const queryTodos = firestore.collection("todos");
// const queryPemberitahuan = firestore.collection("pemberitahuan");

function main() {
  queryTodos.onSnapshot(
    (snapshot) => {
      snapshot.docs.forEach((docTD) => {
        const data = docTD.data() as IToDo;

        if (data.date != null) {
          const currentTime = TimestampNow;
          const targetTime = data.date;
          fung({
            data,
            currentTime,
            targetTime,
            docTD,
          });
        }
      });
    },
    (error) => {
      console.log("Error getting documents: ", error);
    }
  );
}

const fung = async ({
  data,
  currentTime,
  targetTime,
  docTD,
}: {
  data: IToDo;
  currentTime: admin.firestore.Timestamp;
  targetTime: admin.firestore.Timestamp;
  docTD: admin.firestore.QueryDocumentSnapshot<admin.firestore.DocumentData>;
}) => {
  //kondisi telah mencapai tgl yang di agendakan
  if (currentTime == targetTime) {
    console.log(
      `data user ${data.userId} kondisi telah mencapai tgl yang di agendakan`
    );

    await sendNotification({
      topic: data.userId,
      title: data.title,
      body: `Catatan anda dengan deskripsi ${data.descripsion} telah mencapai jadwal yang di agendakan`,
    });
  }
  //kondisi telah melewati tgl yang di agendakan
//   if (currentTime >= targetTime) {
//     console.log(
//       `data user ${data.userId} kondisi telah melewati tgl yang di agendakan`
//     );
//     // kode ini akan mengubah status selesai ketika telah sampai tanggal yang di agendakan
//     await queryTodos.doc(docTD.id).update({ isDone: true });
//   }
};

main();
