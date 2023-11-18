import { Stack, Text, Wrap } from "@chakra-ui/react"
import Button from "components/common/Button"
import Card from "components/common/Card"
import GuildLogo from "components/common/GuildLogo"
import GuildCard from "components/explorer/GuildCard"
import { forwardRef } from "react"
import { GuildBase } from "types"

import SelectDiffuculity from "./SelectDifficulity"
import StatusDisplay from "./StatusDisplay"

import { GDG_MODE, GDG_STATUS } from "./constants"
import useGuessTheGuildGame from "./hooks/useGuessTheGuildGame"

type Props = {
  guilds: GuildBase[]
}

const GuessTheGuildGame = forwardRef(({ guilds }: Props, ref: any) => {
  const {
    round: { questions, options, submit: onGuess },
    gameMode,
    status,
    score,
    record,
    difficulity,
    onDifficulityChange,
    startGame,
  } = useGuessTheGuildGame({ guildsInitial: guilds })

  const isGuessMode = gameMode === GDG_MODE.GUESS

  return (
    <Stack w="full" alignItems="center">
      <Card w="full" maxW="md" p="4" borderRadius="xl" alignItems="center">
        <Text fontSize="26">Guess the Guild</Text>
        <Text fontSize="14">the most awesomest minigame</Text>
      </Card>

      {status === GDG_STATUS.INIT ? (
        <Card w="full" maxW="md" p="4" borderRadius="xl" alignItems="center">
          <SelectDiffuculity value={difficulity} onChange={onDifficulityChange} />
          <Button w="full" colorScheme="green" onClick={startGame}>
            Let's gooo!
          </Button>
        </Card>
      ) : (
        <>
          <StatusDisplay
            score={score}
            record={record}
            difficulity={difficulity}
            onDifficulityChange={onDifficulityChange}
          />
          <Card w="full" maxW="md" p="4" borderRadius="xl" alignItems="center">
            {isGuessMode ? (
              <>
                <Text mb="4">Guess the guild by the logo</Text>
                <GuildLogo size="28" imageUrl={options[0].imageUrl} />
                <Text p="4">???</Text>
                <Stack w="full" mb="4">
                  {options.map((guild) => (
                    <Button key={guild.id}>{guild.name}</Button>
                  ))}
                </Stack>
              </>
            ) : (
              <>
                <Text mb="4">Pair the logos to the guilds</Text>
                <Wrap p="4" spacingX={4}>
                  {options.map((guild) => (
                    <GuildLogo key={guild.id} imageUrl={guild.imageUrl} />
                  ))}
                </Wrap>
                <Stack w="full" mb="4">
                  {options.map((guild) => (
                    <GuildCard
                      key={guild.id}
                      guildData={{ ...guild, imageUrl: "" }}
                    />
                  ))}
                </Stack>
              </>
            )}
            <Button w="full" h="8" colorScheme="green" onClick={onGuess}>
              I'm sure
            </Button>
          </Card>
        </>
      )}
    </Stack>
  )
})

export default GuessTheGuildGame
