import { ButtonGroup, Flex, Spacer, Stack, Text, Wrap } from "@chakra-ui/react"
import Button from "components/common/Button"
import Card from "components/common/Card"
import GuildLogo from "components/common/GuildLogo"
import GuildCard from "components/explorer/GuildCard"
import { forwardRef } from "react"
import { GuildBase } from "types"

type Props = {
  guilds: GuildBase[]
}

const GuessTheGuildGame = forwardRef(({ guilds }: Props, ref: any) => {
  const options = guilds.filter(({ imageUrl }) => imageUrl?.length).slice(0, 4)

  return (
    <Stack w="full" alignItems="center">
      <Card w="full" maxW="md" p="4" borderRadius="xl" alignItems="center">
        <Text fontSize="26">Guess the Guild</Text>
        <Text fontSize="14">the most awesomest minigame</Text>
      </Card>

      <Card w="full" maxW="md" p="4" borderRadius="xl" alignItems="center">
        <Text mb="2" align="center">
          How hard do you like it? <br />( be honest! )
        </Text>
        <Stack w="full" p="4">
          <Button size="sm">EZPZ 👶</Button>
          <Button size="sm">What do you mean, casual? 🙂</Button>
          <Button size="sm">IDDQD 💀</Button>
        </Stack>
        <Button w="full" colorScheme="green">
          Let's gooo!
        </Button>
      </Card>

      <Card w="full" maxW="md" p="4" borderRadius="xl">
        <Flex w="full" align="end" wrap="wrap">
          <Text fontSize="14" p="1">
            🏆 66
          </Text>
          <Spacer />
          <ButtonGroup isAttached>
            <Button size="sm">👶</Button>
            <Button size="sm">🙂</Button>
            <Button size="sm">💀</Button>
          </ButtonGroup>
        </Flex>
        <Text p="1" fontSize="3xl">
          Score: 13
        </Text>
      </Card>

      <Card w="full" maxW="md" p="4" borderRadius="xl" alignItems="center">
        <Text mb="4">Guess the guild by the logo</Text>
        <GuildLogo size="28" imageUrl={options[0].imageUrl} />
        <Text p="4">???</Text>
        <Stack w="full" mb="4">
          {options.map((guild) => (
            <Button key={guild.id}>{guild.name}</Button>
          ))}
        </Stack>
        <Button w="full" h="8" colorScheme="green">
          I'm sure
        </Button>
      </Card>

      <Card w="full" maxW="md" p="4" borderRadius="xl" alignItems="center">
        <Text mb="4">Pair the logos to the guilds</Text>
        <Wrap p="4" spacingX={4}>
          {options.map((guild) => (
            <GuildLogo key={guild.id} imageUrl={guild.imageUrl} />
          ))}
        </Wrap>
        <Stack w="full" mb="4">
          {options.map((guild) => (
            <GuildCard key={guild.id} guildData={{ ...guild, imageUrl: "" }} />
          ))}
        </Stack>
        <Button w="full" h="8" colorScheme="green">
          Let's call it
        </Button>
      </Card>
    </Stack>
  )
})

export default GuessTheGuildGame
