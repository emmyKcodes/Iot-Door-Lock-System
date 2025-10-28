import DisableDoorForm from "./DisableDoorForm";

async function fetchDoorStatus() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/door`,
      {
        cache: "no-store",
      }
    );
    const data = await response.json();
    return data.lock || false;
  } catch (error) {
    console.error("Failed to fetch door status:", error);
    return false;
  }
}

export default async function DisableDoorTemporarily() {
  const doorDisabled = await fetchDoorStatus();

  return <DisableDoorForm initialDoorDisabled={doorDisabled} />;
}
