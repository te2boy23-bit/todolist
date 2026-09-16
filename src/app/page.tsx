import { redirect } from "next/navigation";
import { getProfile } from "@/app/actions/profile";
import { LandingHero } from "@/components/home/LandingHero";

export default async function Home() {
  const profile = await getProfile();

  if (profile) {
    redirect("/projects");
  }

  return (
    <>
      <LandingHero />
    </>
  );
}
