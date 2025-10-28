  import ChangeKeyForm from "./ChangeKeyForm";

  async function checkPinExists() {
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
        }/api/check-pin-exists`,
        {
          cache: "no-store",
        }
      );
      const data = await response.json();
      return data.exists;
    } catch (error) {
      console.error("Failed to check PIN status:", error);
      return false;
    }
  }

  export default async function ChangeKeyPage() {
    const pinExists = await checkPinExists();

    return <ChangeKeyForm initialPinExists={pinExists} />;
  }
