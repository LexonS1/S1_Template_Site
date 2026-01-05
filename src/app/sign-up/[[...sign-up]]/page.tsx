import { SignUp } from "@clerk/nextjs";
import { Container, Stack } from "@mantine/core";

export default function SignUpPage() {
  return (
    <Container size="xs" py="xl">
      <Stack align="center" mt={100}>
        <SignUp />
      </Stack>
    </Container>
  );
}
