export const config = {
  runtime: "experimental-edge",
}

const handler = async () =>
  new Response(`Failed to generate the image`, { status: 500 })

export default handler
