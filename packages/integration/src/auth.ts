export type MockAuthServerArgs = {
  port: number;
};

export function getMockAuthServer({ port }: MockAuthServerArgs) {
  return () => {
    return new Response(
      JSON.stringify({
        issuer: `http://localhost:${port}`,
        code_challenge_methods_supported: ["S256"],
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  };
}
