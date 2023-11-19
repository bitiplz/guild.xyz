import { Flex, Stack, Text, Wrap } from "@chakra-ui/react"
import GuildLogo from "components/common/GuildLogo"
import GuildCard from "components/explorer/GuildCard"
import { GuildBase } from "types"

type Props = {
  questions: GuildBase[]
  options: GuildBase[]
  answers: GuildBase[]
  setAnswers: (GuildBase) => void
  showResults?: boolean
}

const PairsModeForm = ({ questions, options, answers, setAnswers }: Props) => {
  const handleClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  return (
    <>
      <Text mb="4">Pair the logos to the guilds</Text>
      <Wrap p="4" spacingX={4}>
        {options.map((guild) => (
          <GuildLogo key={guild.id} imageUrl={guild.imageUrl} />
        ))}
      </Wrap>
      <Stack w="full" mb="4">
        {questions.map((guild, i) => (
          <Flex key={guild.id} onClick={handleClick}>
            <GuildCard
              guildData={{ ...guild, imageUrl: answers[i]?.imageUrl || "" }}
            />
          </Flex>
        ))}
      </Stack>
    </>
  )
}

export default PairsModeForm
