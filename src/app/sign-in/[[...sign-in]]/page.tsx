import { SignIn } from "@clerk/nextjs";
import { Container, Stack } from "@mantine/core";

export default function SignInPage() {
  return (
    <Container size="xs" py="xl">
      <Stack align="center" mt={100}>
        <SignIn />
      </Stack>
    </Container>
  );
}
