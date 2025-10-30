import SmartDoorClient from "./SmartDoorClient";

async function fetchDoorState() {
  try {
    const [doorRes, disableRes] = await Promise.all([
      fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
        }/api/door`,
        { cache: "no-store" }
      ),
      fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
        }/api/disable-door`,
        { cache: "no-store" }
      ),
    ]);

    const [doorData, disableData] = await Promise.all([
      doorRes.json(),
      disableRes.json(),
    ]);

    return {
      locked: doorData.lock || false,
      disabled: disableData.disabled || false,
      error: null,
    };
  } catch (error) {
    console.error("Failed to fetch door state:", error);
    return {
      locked: false,
      disabled: false,
      error: "Failed to connect to door system",
    };
  }
}

export default async function SmartDoorHomepage() {
  const doorState = await fetchDoorState();
  return <SmartDoorClient initialDoorState={doorState} />;
}
