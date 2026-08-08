import { NextResponse } from "next/server";

import { createRfqReference, MAX_RFQ_BODY_BYTES, parseRfqInput } from "@/lib/rfq";

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    return NextResponse.json({ message: "Use application/json with file metadata only." }, { status: 415 });
  }

  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_RFQ_BODY_BYTES) {
    return NextResponse.json({ message: "The RFQ request body exceeds 64 KB." }, { status: 413 });
  }

  let text: string;
  try {
    text = await request.text();
  } catch {
    return NextResponse.json({ message: "The RFQ request body could not be read." }, { status: 400 });
  }
  if (new TextEncoder().encode(text).byteLength > MAX_RFQ_BODY_BYTES) {
    return NextResponse.json({ message: "The RFQ request body exceeds 64 KB." }, { status: 413 });
  }

  let body: unknown;
  try {
    body = JSON.parse(text) as unknown;
  } catch {
    return NextResponse.json({ message: "The request body was not valid RFQ JSON." }, { status: 400 });
  }

  const { value: input, errors } = parseRfqInput(body);
  if (Object.keys(errors).length) {
    return NextResponse.json({ message: "Review the highlighted RFQ fields.", errors }, { status: 422 });
  }

  return NextResponse.json({
    reference: createRfqReference(),
    status: "prototype-accepted",
    persisted: false,
    uploadedFileBytesStored: false,
    fileMetadataCount: input.files.length,
  }, { status: 201 });
}
