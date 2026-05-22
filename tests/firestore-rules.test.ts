import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { readFileSync } from "fs";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  addDoc
} from "firebase/firestore";

let testEnv: RulesTestEnvironment;

async function setup() {
  testEnv = await initializeTestEnvironment({
    projectId: "pote-sagrado-casais",
    firestore: {
      rules: readFileSync("firestore.rules", "utf8"),
    },
  });
}

async function teardown() {
  await testEnv.cleanup();
}

async function runTests() {
  console.log("Starting Firestore Rules Tests...");
  await setup();

  try {
    // 1. Test User Isolation
    const aliceId = "alice";
    const aliceContext = testEnv.authenticatedContext(aliceId);
    const aliceDb = aliceContext.firestore();

    console.log("Testing: User can create their own profile...");
    await assertSucceeds(setDoc(doc(aliceDb, "users", aliceId), {
      theme: "cookbook",
      casalId: "casal_alice"
    }));

    console.log("Testing: User CANNOT modify their casalId after creation...");
    await assertFails(updateDoc(doc(aliceDb, "users", aliceId), {
      casalId: "casal_bob"
    }));

    console.log("Testing: User CANNOT modify isPremium...");
    await assertFails(updateDoc(doc(aliceDb, "users", aliceId), {
      isPremium: true
    }));

    // 2. Test Casal Access
    const casalId = "casal_alice";
    console.log("Testing: Member can read their casal document...");
    await assertSucceeds(getDoc(doc(aliceDb, "casais", casalId)));

    const eveId = "eve";
    const eveContext = testEnv.authenticatedContext(eveId);
    const eveDb = eveContext.firestore();

    console.log("Testing: Non-member CANNOT read other casal document...");
    await assertFails(getDoc(doc(eveDb, "casais", casalId)));

    // 3. Test Deposits
    console.log("Testing: Member can create deposit for themselves...");
    await assertSucceeds(addDoc(collection(aliceDb, `casais/${casalId}/deposits`), {
      amount: 100,
      who: aliceId,
      createdAt: new Date()
    }));

    console.log("Testing: Member CANNOT create deposit for someone else...");
    await assertFails(addDoc(collection(aliceDb, `casais/${casalId}/deposits`), {
      amount: 100,
      who: "bob",
      createdAt: new Date()
    }));

    console.log("Tests Completed Successfully!");
  } catch (error) {
    console.error("Test Failed:", error);
    process.exit(1);
  } finally {
    await teardown();
  }
}

runTests();
