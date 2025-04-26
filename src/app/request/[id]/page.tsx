import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { RequestInfo } from "@/components/request-info/server";
import { LinearProgress, Typography } from "@mui/material";
import { orange } from "@mui/material/colors";
import { getServerSession, Session } from "next-auth";
import { getSession } from "next-auth/react";
import { Suspense } from "react";

export default function RequestInfoPage({
  params,
}: {
  params: { id: string };
}) {

  return (
    <>
      <Typography
        variant="h4"
        component="h1"
        align="center"
        gutterBottom
        sx={{ color: orange[800], fontWeight: "bold", mb: 8 }}
      >
        Shop Request
      </Typography>
      <Suspense fallback={<LinearProgress/>}>
        <RequestInfo id={params.id} />
      </Suspense>
    </>
  );
}
