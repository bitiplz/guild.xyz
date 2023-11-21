import { Flex, Spacer, Text } from "@chakra-ui/react"
import Card from "components/common/Card"

import SelectDiffuculity from "./SelectDifficulity"

type Props = {
  record: number
  score: number
  difficulity: string
  onDifficulityChange: (String) => void
}

const StatusDiplay = ({
  record,
  score,
  difficulity,
  onDifficulityChange,
}: Props) => {
  const isNewRecord = Boolean(record && record === score)
  const scoreLabel = `Score: ${score}`
  const recordLabel = `🏆 ${record} ${isNewRecord ? "(New Record!)" : ""}`

  return (
    <Card w="full" maxW="md" p="4" borderRadius="xl">
      <Flex w="full" align="end" wrap="wrap">
        <Text fontSize="14" p="1">
          {recordLabel}
        </Text>
        <Spacer />
        <SelectDiffuculity
          small
          value={difficulity}
          onChange={onDifficulityChange}
        />
      </Flex>

      <Text p="1" fontSize="3xl">
        {scoreLabel}
      </Text>
    </Card>
  )
}

export default StatusDiplay
