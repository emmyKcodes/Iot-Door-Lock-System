import SmartDoorClient from "./SmartDoorClient";

async function fetchDoorState() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/door`,
      {
        cache: "no-store",
      }
    );
    const data = await response.json();
    return {
      locked: data.lock || false,
      error: null,
    };
  } catch (error) {
    console.error("Failed to fetch door state:", error);
    return {
      locked: false,
      error: "Failed to connect to door system",
    };
  }
}

export default async function SmartDoorHomepage() {
  const doorState = await fetchDoorState();

  return <SmartDoorClient initialDoorState={doorState} />;
}
