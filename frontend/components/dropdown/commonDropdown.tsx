import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/react";
import { ChevronDown } from "lucide-react";

export interface DropdownOption {
    key: string;
    label: string;
}

interface CommonDropdownProps {
    label: string;
    selectedKey: string;
    options: DropdownOption[];
    onChange: (selectedKey: string) => void;
}

export const CommonSingleSelectDropdown: React.FC<CommonDropdownProps> = ({
    label,
    selectedKey,
    options,
    onChange,
}) => {
    return (
        <Dropdown>
            <DropdownTrigger>
                <Button endContent={<ChevronDown className="w-4 h-4" />} variant="bordered">
                    {label}
                </Button>
            </DropdownTrigger>
            <DropdownMenu
                selectedKeys={[selectedKey]}
                selectionMode="single"
                onSelectionChange={(keys) => onChange(`${Array.from(keys)[0]}`)}
            >
                {options.map((option) => (
                    <DropdownItem key={option.key}>{option.label}</DropdownItem>
                ))}
            </DropdownMenu>
        </Dropdown>
    );
};
