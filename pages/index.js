import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/usdc"); // Redirect to the USDC page
  }, []);

  return (
    <div>
      <h1>Redirecting to USDC page...</h1>
    </div>
  );
}
