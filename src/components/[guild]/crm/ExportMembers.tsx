import { Table } from "@tanstack/react-table"
import Button from "components/common/Button"
import useToast from "hooks/useToast"
import { Export } from "phosphor-react"
import { useIsTabsStuck } from "../Tabs/Tabs"
import { Member } from "./useMembers"

type Props = {
  table: Table<Member>
}

const ExportMembers = ({ table }: Props) => {
  const { isStuck } = useIsTabsStuck()
  const toast = useToast()

  const value = table
    .getSelectedRowModel()
    .rows.map((row) => row.original.addresses[0])

  const csvContent = encodeURI("data:text/csv;charset=utf-8," + value)

  const isDisabled = !(table.getIsSomeRowsSelected() || table.getIsAllRowsSelected())

  return (
    <Button
      flexShrink={0}
      as="a"
      download="members"
      href={!isDisabled ? csvContent : undefined}
      onClick={() =>
        // beeing disabled doesn't prevent onClick automatically, because of being an anchor instead of a button
        !isDisabled &&
        toast({
          status: "success",
          title: "Successful export",
          description: "Check your downloads folder",
          duration: 2000,
        })
      }
      leftIcon={<Export />}
      variant="ghost"
      colorScheme={isStuck ? "gray" : "whiteAlpha"}
      isDisabled={isDisabled}
      size="sm"
    >
      {`Export ${value.length || ""} selected`}
    </Button>
  )
}

export default ExportMembers
