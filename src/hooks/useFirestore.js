import { collection, doc, onSnapshot, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "./../DB/DB_init";

const useFirestore = () => {
  const [data, setData] = useState({});

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "portfolio_data"), (res) => {
      const tmpData = {};

      res.forEach((doc) => {
        tmpData[doc.id] = doc.data();
      });

      res.size === Object.keys(tmpData).length && setData(tmpData);
    });

    return unsubscribe;
  }, []);

  const setDocuments = (id, data) => {
    return new Promise(async (resolve, reject) => {
      try {
        await setDoc(doc(db, "portfolio_data", id), data);
        resolve({ message: "Product Added Successfully" }, { merge: true });
      } catch (e) {
        reject(e);
      }
    });
  };

  return { data, setDocuments };
};

export default useFirestore;
