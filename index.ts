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
        // console.log(data);
        // console.log(`dateTime ${data.dateTime}`);

        if (data.dateTime != null) {
          console.log("run active");

          const currentTime = TimestampNow;
          const targetTime = data.dateTime;

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
  // console.log(currentTime);
  // console.log(targetTime);

  const dateInit = targetTime.toDate();
  const dateNow = currentTime.toDate();

  const hour = dateInit.getHours();
  const minute = dateInit.getMinutes();
  const second = dateInit.getSeconds();

  const hourNow = dateNow.getHours();
  const minuteNow = dateNow.getMinutes();
  const secondNow = dateNow.getSeconds();

  const year = dateInit.getFullYear();
  const month = dateInit.getMonth() + 1; // Months are zero-based, so add 1
  const day = dateInit.getDate();

  const yearNow = dateNow.getFullYear();
  const monthNow = dateNow.getMonth() + 1; // Months are zero-based, so add 1
  const dayNow = dateNow.getDate();

  console.log(`hourNow: ${hourNow}, minuteNow: ${minuteNow}, secondNow: ${secondNow}`);
  console.log(`Hour: ${hour}, Minute: ${minute}, Second: ${second}`);

  console.log(`yearNow: ${yearNow}, monthNow: ${monthNow}, dayNow: ${dayNow}`);
  console.log(`Year: ${year}, Month: ${month}, Day: ${day}`);

  const y = yearNow === year;
  const m = monthNow === month;
  const d = dayNow === day;
  const h = hourNow === hour;
  const mn = minuteNow === minute;
  const s = secondNow === second;

  console.log(y && m && d && h && mn && s);

  if (y && m && d && h && mn && s) {
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

// function mainLoop() {
//   setInterval(() => {
//     try {
//       main();
//     } catch (error) {
//       console.error("Error in main function:", error);
//     }
//   }, 10000); // Adjust the interval as needed
// }

// mainLoop();
