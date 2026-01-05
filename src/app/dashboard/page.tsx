import { currentUser } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { Container, Group, Paper, Stack, Text, Title } from "@mantine/core";

export default async function DashboardPage() {
  const user = await currentUser();

  return (
    <Container size="md" py="xl">
      <Stack gap="lg">
        <Group justify="space-between">
          <Title order={2}>Dashboard</Title>
          <UserButton />
        </Group>

        <Paper p="lg" withBorder>
          <Stack gap="sm">
            <Text size="lg" fw={500}>
              Welcome, {user?.firstName || user?.emailAddresses[0]?.emailAddress}
            </Text>
            <Text c="dimmed" size="sm">
              You are signed in. Start building your app from here.
            </Text>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
