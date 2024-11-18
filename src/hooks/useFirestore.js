import { collection, doc, onSnapshot, setDoc } from "firebase/firestore";
import { useEffect, useState, useCallback, useMemo } from "react";
import { db } from "./../DB/DB_init";

const useFirestore = () => {
  const [data, setData] = useState({});

  // Memoize collection reference
  const collectionRef = useMemo(() => collection(db, "portfolio_data"), []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collectionRef, (snapshot) => {
      // Process snapshot data in one pass
      const tmpData = Object.fromEntries(
        snapshot.docs.map((doc) => [doc.id, doc.data()])
      );
      setData(tmpData);
    });

    return () => unsubscribe();
  }, [collectionRef]);
  // Memoize setDocuments function
  const UpdateData = useCallback(
    async (id, data) => {
      try {
        const docRef = doc(collectionRef, id);
        await setDoc(docRef, data, { merge: true });
        return { message: "Data Updated Successfully" };
      } catch (e) {
        throw e;
      }
    },
    [collectionRef]
  );

  const AddData = useCallback(
    async (id, newData) => {
      try {
        const docRef = doc(collectionRef, id);
        // Get existing data first
        const existingData = data[id] || {};

        // If data field exists, append to array, otherwise create new array
        const updatedData = {
          data: existingData.data ? [...existingData.data, newData] : [newData],
        };

        await setDoc(docRef, updatedData);
        return { message: "Data Added Successfully" };
      } catch (e) {
        throw e;
      }
    },
    [collectionRef, data]
  );

  return { data, UpdateData, AddData };
};

export default useFirestore;
