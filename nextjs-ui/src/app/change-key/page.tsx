import ChangeKeyForm from "./ChangeKeyForm";

async function checkPinExists() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? ""}/api/check-pin-exists`,
      {
        cache: "no-store",
      }
    );

    if (!res.ok) throw new Error("Failed to check PIN status");
    const data = await res.json();
    return data.exists ?? false;
  } catch (error) {
    console.error("Error checking PIN:", error);
    return false;
  }
}

export default async function ChangeKeyPage() {
  const pinExists = await checkPinExists();

  return <ChangeKeyForm initialPinExists={pinExists} />;
}
