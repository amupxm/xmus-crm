import { useLeave } from "@/hooks/useLeave";
import { Textarea } from "@heroui/input";
import {
  Button,
  DateRangePicker,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
} from "@heroui/react";
import { ENUM_LEAVE_TYPE, ILeaveRequestCreate } from "@internal-cms/shared/src/api/leaves";
import { CalendarDate, isWeekend } from "@internationalized/date";
import { useLocale } from "@react-aria/i18n";
import { useEffect, useState } from "react";
const AskForLeaveModal = ({
  isOpen,
  onOpenChange,
  refreshData,
}: {
  isOpen: boolean;
  onOpenChange: () => void;
  refreshData: () => void; // Optional, if you want to refresh data after adding leave
}) => {
  const [leaveType, setLeaveType] = useState<ENUM_LEAVE_TYPE | null>(null);
  const [reason, setReason] = useState("");
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });
  const [errors, setErrors] = useState<{ leaveType?: string; reason?: string; dateRange?: string }>({});
  const [isAddingLeave, setIsAddingLeave] = useState(false);
  const [yearlyHolidays, setYearlyHolidays] = useState<Array<[start: Date, end: Date]>>([]);
  const { createLeave, getYearlyHolidays, isGettingYearlyHolidays } = useLeave();
  let { locale } = useLocale();

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!leaveType) newErrors.leaveType = "Leave type is required.";
    if (!dateRange.start || !dateRange.end) newErrors.dateRange = "Date range is required.";
    if (!reason.trim()) newErrors.reason = "Reason is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addNewLeave = async () => {
    if (!validate()) return;

    const data: ILeaveRequestCreate = {
      type: leaveType!,
      reason: reason.trim(),
      startDate: dateRange.start!,
      endDate: dateRange.end!,
    };

    try {
      setIsAddingLeave(true);
      await createLeave(data);
      refreshData();
      onOpenChange(); // Close modal on success
      // Optionally reset form here
    } catch (error) {
      console.error("Leave request failed:", error);
    } finally {
      setIsAddingLeave(false);
    }
  };
  useEffect(() => {
    if (!isOpen) return;
    getYearlyHolidays().then((data) => {
      let disabledRanges: Array<[start: Date, end: Date]> = [];

      data.holidays.forEach((holiday) => {
        disabledRanges.push(
          [
            new Date(holiday.date), new Date(holiday.date)
          ]
        )
      })
      setYearlyHolidays(disabledRanges);
    })
  }, [isOpen])
  const toCalendarDate = (date: Date): CalendarDate => {
    return new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
  }

  return (
    <>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} closeButton={!isAddingLeave}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Request for leave</ModalHeader>
              {!isGettingYearlyHolidays ? (<>
                <ModalBody className="space-y-4">
                  <div>
                    <Select
                      className="max-w-xs"
                      label="Select leave type:"
                      selectedKeys={leaveType ? [leaveType] : []}
                      onSelectionChange={(keys) => {
                        const selected = Array.from(keys)[0] as ENUM_LEAVE_TYPE;
                        setLeaveType(selected);
                        setErrors((prev) => ({ ...prev, leaveType: undefined }));
                      }}
                    >
                      <SelectItem key={ENUM_LEAVE_TYPE.SICK}>Sick Leave</SelectItem>
                      <SelectItem key={ENUM_LEAVE_TYPE.VACATION}>Vacation Leave</SelectItem>
                      <SelectItem key={ENUM_LEAVE_TYPE.CASUAL}>Casual Leave</SelectItem>
                      <SelectItem key={ENUM_LEAVE_TYPE.WFH}>Work From Home</SelectItem>
                    </Select>
                    {errors.leaveType && <p className="text-red-500 text-sm mt-1">{errors.leaveType}</p>}
                  </div>

                  <div>
                    <DateRangePicker
                      allowsNonContiguousRanges
                      isDateUnavailable={(date) =>
                        isWeekend(date, locale) ||
                        yearlyHolidays.some(
                          (interval) =>
                            date.compare(toCalendarDate(interval[0])) >= 0 &&
                            date.compare(toCalendarDate(interval[1])) <= 0
                        )
                      }
                      className="max-w-xs"
                      label="Leave duration"
                      onChange={(range) => {
                        setDateRange({
                          start: range?.start ? new Date(range.start.toString()) : null,
                          end: range?.end ? new Date(range.end.toString()) : null,
                        });
                        setErrors((prev) => ({ ...prev, dateRange: undefined }));
                      }}
                    />
                    {errors.dateRange && <p className="text-red-500 text-sm mt-1">{errors.dateRange}</p>}
                  </div>

                  <div>
                    <Textarea
                      className="max-w-xs"
                      label="Description"
                      placeholder="Enter your reason"
                      value={reason}
                      onChange={(e) => {
                        setReason(e.target.value);
                        setErrors((prev) => ({ ...prev, reason: undefined }));
                      }}
                    />
                    {errors.reason && <p className="text-red-500 text-sm mt-1">{errors.reason}</p>}
                  </div>
                </ModalBody>

                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose} disabled={isAddingLeave}>
                    Close
                  </Button>
                  <Button
                    color="primary"
                    isLoading={isAddingLeave}
                    onPress={addNewLeave}
                    disabled={isAddingLeave}
                  >
                    <span className="flex items-center justify-center">
                      {isAddingLeave ? "Submitting..." : "Submit"}
                    </span>
                  </Button>
                </ModalFooter>
              </>) : <></>}
            </>
          )}
        </ModalContent>
      </Modal></>
  );
};

export default AskForLeaveModal;
