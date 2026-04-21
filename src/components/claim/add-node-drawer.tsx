import type { AddNodeValues } from '@/types'
import { NativeSelect } from '@/components/claim/native-select'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export function AddNodeDrawer({
  open,
  onOpenChange,
  values,
  nodeFormError,
  onTypeChange,
  onMessageChange,
  onPriorityChange,
  onAttachmentNameChange,
  onReviewNoteChange,
  onReviewStateChange,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  values: AddNodeValues
  nodeFormError: string | null
  onTypeChange: (value: string) => void
  onMessageChange: (value: string) => void
  onPriorityChange: (value: string) => void
  onAttachmentNameChange: (value: string) => void
  onReviewNoteChange: (value: string) => void
  onReviewStateChange: (value: string) => void
  onSubmit: () => void
}) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[92vh] md:mx-auto md:max-w-2xl">
        <DrawerHeader>
          <DrawerTitle>Insert a dynamic node</DrawerTitle>
          <DrawerDescription>
            Add an information note or an attachment checkpoint between process
            stages without touching the original payload.
          </DrawerDescription>
        </DrawerHeader>

        <div className="space-y-4 px-4 pb-2 md:px-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Node type</label>
            <NativeSelect
              value={values.type}
              onChange={onTypeChange}
              options={[
                { value: 'note', label: 'Information Note' },
                { value: 'attachment', label: 'Additional Attachment' },
              ]}
            />
          </div>

          {values.type === 'note' ? (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Message</label>
                <Textarea
                  placeholder="For example: Customer confirmed that the workplace certificate will be uploaded by tomorrow morning."
                  value={values.message}
                  onChange={(event) => onMessageChange(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <NativeSelect
                  value={values.emphasis}
                  onChange={onPriorityChange}
                  options={[
                    { value: 'FYI', label: 'FYI' },
                    { value: 'Important', label: 'Important' },
                    { value: 'Urgent', label: 'Urgent' },
                  ]}
                />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Attachment name</label>
                <Input
                  className="h-11"
                  placeholder="Occupational_Certificate_v2.pdf"
                  value={values.fileName}
                  onChange={(event) => onAttachmentNameChange(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Review note</label>
                <Textarea
                  placeholder="Explain why this file was added at this point in the flow."
                  value={values.note}
                  onChange={(event) => onReviewNoteChange(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Review state</label>
                <NativeSelect
                  value={values.reviewStatus}
                  onChange={onReviewStateChange}
                  options={[
                    { value: 'Awaiting Review', label: 'Awaiting Review' },
                    { value: 'Ready for Validation', label: 'Ready for Validation' },
                  ]}
                />
              </div>
            </>
          )}

          {nodeFormError ? (
            <p className="text-sm text-destructive">{nodeFormError}</p>
          ) : null}
        </div>

        <DrawerFooter>
          <Button className="h-11" onClick={onSubmit}>
            Save dynamic node
          </Button>
          <Button
            className="h-11"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
