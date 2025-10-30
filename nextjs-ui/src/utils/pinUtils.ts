export async function checkPinExists(): Promise<boolean> {
  try {
    const response = await fetch("/api/check-pin-exists");

    if (!response.ok) {
      console.error("Failed to check PIN existence");
      return false;
    }

    const data = await response.json();
    console.log("PIN existence result:", data);

    return data.exists; 
  } catch (error) {
    console.error("Error checking PIN existence:", error);
    return false;
  }
}
