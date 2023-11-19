import { Button, Card, Stack, Text, Wrap } from "@chakra-ui/react"
import GuildLogo from "components/common/GuildLogo"
import { GuildCardLayout } from "components/explorer/GuildCard"
import { GuildBase } from "types"

type Props = {
  questions: GuildBase[]
  options: GuildBase[]
  answers: GuildBase[]
  setAnswers: (GuildBase) => void
  showResults?: boolean
}

const PairsModeForm = ({
  questions,
  options,
  answers,
  setAnswers,
  showResults,
}: Props) => {
  const getBtnColor = (idx) => {
    let color

    if (showResults) {
      if (questions[idx].id === answers[idx].id) {
        color = "green"
      } else {
        color = "red"
      }
    }

    return color
  }

  const updateAnswers = (idx, guild) => {
    const update = [...answers]
    update[idx] = guild
    setAnswers(update)
  }

  const updateNextAnswer = (guild) => {
    const nextIdxToUpdate = answers.findIndex((a) => a === null)

    if (nextIdxToUpdate > -1) {
      updateAnswers(nextIdxToUpdate, guild)
    }
  }

  const removeAnswer = (idx) => {
    if (!showResults){
      updateAnswers(idx, null)
    }
  }

  const answerUsed = (guild) =>
    Boolean(answers.find((answer) => answer?.id === guild.id))

  return (
    <>
      <Text>Pair the logos to the guilds</Text>
      <Text mb="4" fontSize={14} colorScheme="gray">
        ( just click them in order )
      </Text>
      <Wrap p="4" spacingX={4}>
        {options.map((guild) => (
          <Button
            key={guild.id}
            py="2"
            h="auto"
            onClick={() => updateNextAnswer(guild)}
            isDisabled={answerUsed(guild)}
          >
            <GuildLogo imageUrl={guild.imageUrl} />
          </Button>
        ))}
      </Wrap>
      <Stack w="full" mb="4">
        {questions.map((guild, i) => (
          <Button
            as={Card}
            key={guild.id}
            onClick={() => removeAnswer(i)}
            isDisabled={showResults || !answers[i]}
            colorScheme={getBtnColor(i)}
            h="auto"
            px={{ base: 5, md: 6 }}
            py={{ base: 6, md: 7 }}
          >
            <GuildCardLayout
              guildData={{
                ...guild,
                imageUrl: showResults ? guild.imageUrl : answers[i]?.imageUrl || "",
              }}
            />
          </Button>
        ))}
      </Stack>
    </>
  )
}

export default PairsModeForm
