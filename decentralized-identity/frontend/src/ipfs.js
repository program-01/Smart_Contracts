const PINATA_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJhYzhkNjI5MC03OTc1LTQ0ZmUtYjA0MS02YjZhMmYyYzExYjciLCJlbWFpbCI6ImNlc2FybG9wZXozNjAxMkBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiNDM1ZDVkNTRjNmEwMTQ5YWI0OTAiLCJzY29wZWRLZXlTZWNyZXQiOiIyMWI4NTFmN2ZiMWFjNTYwN2JlOGEyMTNjNzRjOGFiMGY2NWU2ODdkZTNkZjBjMDIxMmI5M2UwMjIxYmM1M2ZmIiwiZXhwIjoxNzc1MjM1OTYyfQ.T5JgRYK581MvmejsYE0rJTaK6vGqNFQ96ExzChluqqY"; 

export async function uploadMetadataToIPFS(metadata) {
  const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${PINATA_JWT}`,
    },
    body: JSON.stringify(metadata),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error("❌ Pinata upload failed: " + err);
  }

  const json = await response.json();
  const cid = json.IpfsHash;
  return `https://ipfs.io/ipfs/${cid}`;
}