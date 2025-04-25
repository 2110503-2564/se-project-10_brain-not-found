import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { RequestInfo } from "@/components/request-info/server";
import { Typography } from "@mui/material";
import { orange } from "@mui/material/colors";
import { getServerSession, Session } from "next-auth";
import { Suspense } from "react";

export default async function RequestInfoPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.token) return null;

  return (
    <>
      <Typography
        variant="h4"
        component="h1"
        align="center"
        gutterBottom
        sx={{ color: orange[800], fontWeight: "bold", mb: 5 }}
      >
        Shop Request
      </Typography>
      <Suspense>
        <RequestInfo id={params.id} session={session} />
      </Suspense>
    </>
  );
}
